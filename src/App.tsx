import { useEffect, useRef, useState } from "react";
import { ArtifactForm } from "./components/ArtifactForm";
import { ArtifactList } from "./components/ArtifactList";
import { ArtifactPreview } from "./components/ArtifactPreview";
import { useArtifacts } from "./hooks/useArtifacts";
import { isHtmlFile } from "./lib/filename";
import { downloadFile, exportZip, readFileAsText } from "./lib/files";
import type { Artifact } from "./storage/types";

export default function App() {
  const { artifacts, loading, error, add, update, remove } = useArtifacts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const selected = artifacts.find((a) => a.id === selectedId) ?? null;

  async function addFiles(files: File[]) {
    const html = files.filter(isHtmlFile);
    if (html.length < files.length)
      alert("Bỏ qua các file không phải .html/.htm.");
    let last: Artifact | null = null;
    for (const f of html)
      last = await add({ name: f.name, html: await readFileAsText(f) });
    if (last) setSelectedId(last.id);
  }

  // Hiện lớp phủ khi kéo file vào cửa sổ; lớp phủ nằm trên iframe nên thả ở đâu cũng nhận.
  useEffect(() => {
    const onEnter = (e: DragEvent) =>
      e.dataTransfer?.types.includes("Files") && setDragging(true);
    window.addEventListener("dragenter", onEnter);
    return () => window.removeEventListener("dragenter", onEnter);
  }, []);

  const download = (a: Artifact) => downloadFile(a.name, a.html);

  async function del(a: Artifact) {
    if (!confirm(`Xóa "${a.name}"?`)) return;
    await remove(a.id);
    if (a.id === selectedId) setSelectedId(null);
  }

  async function rename(a: Artifact) {
    const name = prompt("Tên mới", a.name);
    if (name?.trim())
      await update(a.id, { name }).catch((e) =>
        alert(`Đổi tên thất bại: ${e}`),
      );
  }

  return (
    <div className={selected ? "app has-selection" : "app"}>
      <aside className="sidebar">
        <header className="topbar">
          <h1>AI Artifact Viewer</h1>
          <div>
            <button
              className="primary"
              onClick={() => dialog.current?.showModal()}
            >
              + Thêm
            </button>
            <button
              onClick={() => exportZip(artifacts)}
              disabled={!artifacts.length}
              title="Export tất cả thành ZIP"
            >
              ZIP
            </button>
          </div>
        </header>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="empty">Đang tải…</p>
        ) : (
          <ArtifactList
            artifacts={artifacts}
            selectedId={selectedId}
            onOpen={(a) => setSelectedId(a.id)}
            onDelete={del}
            onDownload={download}
          />
        )}
      </aside>

      <main className="main">
        {selected ? (
          <ArtifactPreview
            artifact={selected}
            onBack={() => setSelectedId(null)}
            onDownload={download}
            onRename={rename}
          />
        ) : (
          <p className="empty">Chọn một artifact để xem preview.</p>
        )}
      </main>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
      >
        <ArtifactForm
          onSave={async (data) => setSelectedId((await add(data)).id)}
          onFiles={addFiles}
          onClose={() => dialog.current?.close()}
        />
      </dialog>

      {dragging && (
        <div
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles([...e.dataTransfer.files]).catch((err) =>
              alert(`Lưu thất bại: ${err}`),
            );
          }}
        >
          Thả file HTML để thêm artifact
        </div>
      )}
    </div>
  );
}
