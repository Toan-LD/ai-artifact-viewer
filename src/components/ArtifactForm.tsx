import { useState, type FormEvent } from "react";

interface Props {
  onSave: (data: { name: string; html: string }) => Promise<unknown>;
  onFiles: (files: File[]) => Promise<unknown>;
  onClose: () => void;
}

export function ArtifactForm({ onSave, onFiles, onClose }: Props) {
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    try {
      await task();
      setName("");
      setHtml("");
      onClose();
    } catch (e) {
      // Giữ nguyên nội dung đã dán để người dùng không mất dữ liệu.
      alert(`Lưu thất bại: ${e}`);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!html.trim()) return alert("Nội dung HTML đang trống.");
    run(() => onSave({ name, html }));
  }

  return (
    <form className="form" onSubmit={submit}>
      <header>
        <h2>Thêm artifact</h2>
        <button type="button" onClick={onClose} aria-label="Đóng">
          ✕
        </button>
      </header>

      <label>
        Tên artifact
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="artifact-<timestamp>.html"
        />
      </label>
      <label>
        HTML
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder="<!doctype html>…"
          rows={12}
          spellCheck={false}
        />
      </label>
      <button type="submit" className="primary" disabled={busy}>
        Lưu artifact
      </button>

      <div className="divider">hoặc</div>

      <label className="file">
        Upload file .html / .htm (có thể chọn nhiều)
        <input
          type="file"
          accept=".html,.htm,text/html"
          multiple
          disabled={busy}
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = "";
            if (files.length) run(() => onFiles(files));
          }}
        />
      </label>
      <p className="hint">Có thể kéo thả file HTML vào bất kỳ đâu trong app.</p>
    </form>
  );
}
