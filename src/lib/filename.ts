/**
 * Chuẩn hoá tên artifact: bỏ phần đường dẫn (chống path traversal), ký tự cấm,
 * dấu chấm đầu tên; tên rỗng -> artifact-<timestamp>.html; thiếu đuôi -> thêm .html.
 */
export function sanitizeName(raw: string, now = Date.now()): string {
  const base = (raw.split(/[\\/]/).pop() ?? "")
    // eslint-disable-next-line no-control-regex -- cố ý loại ký tự điều khiển
    .replace(/[\x00-\x1f<>:"|?*]/g, "")
    .replace(/^[.\s]+/, "")
    .trim()
    .slice(0, 120);
  if (!base) return `artifact-${now}.html`;
  return /\.html?$/i.test(base) ? base : `${base}.html`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const isHtmlFile = (f: File) =>
  /\.html?$/i.test(f.name) || f.type === "text/html";
