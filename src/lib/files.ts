import { zipSync } from "fflate";
import type { Artifact } from "../storage/types";

/**
 * Quyền của artifact trong iframe. KHÔNG có allow-same-origin: artifact chạy ở origin "null",
 * không đọc được IndexedDB/cookie/DOM của app dù có JavaScript.
 * Popup mở từ artifact vẫn bị sandbox (không có allow-popups-to-escape-sandbox).
 */
export const SANDBOX = "allow-scripts allow-forms allow-modals allow-popups";

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ponytail: <a download> không chạy trong Android WebView; khi lên Capacitor thay bằng Filesystem.writeFile + Share.
export function downloadFile(
  name: string,
  data: BlobPart,
  type = "text/html;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportZip(artifacts: Artifact[]) {
  const enc = new TextEncoder();
  const files: Record<string, Uint8Array> = {};
  for (const a of artifacts) {
    let name = a.name;
    for (let i = 1; name in files; i++) name = `${i}-${a.name}`;
    files[name] = enc.encode(a.html);
  }
  const zip = zipSync(files);
  downloadFile(
    `artifacts-${new Date().toISOString().slice(0, 10)}.zip`,
    zip as Uint8Array<ArrayBuffer>,
    "application/zip",
  );
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Mở preview ở tab mới. Không mở thẳng blob của artifact (blob URL thừa hưởng origin của app
 * => script trong artifact sẽ đọc được dữ liệu app). Thay vào đó mở một trang bọc không có script,
 * chứa iframe sandbox giống preview chính.
 */
export function openInNewTab(artifact: Artifact) {
  const page = `<!doctype html><meta charset="utf-8"><title>${escapeAttr(artifact.name)}</title>
<style>html,body,iframe{margin:0;width:100%;height:100%;border:0;display:block}</style>
<iframe sandbox="${SANDBOX}" srcdoc="${escapeAttr(artifact.html)}"></iframe>`;
  const url = URL.createObjectURL(new Blob([page], { type: "text/html" }));
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
