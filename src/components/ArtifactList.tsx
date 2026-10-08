import { useMemo, useState } from "react";
import { formatSize } from "../lib/filename";
import type { Artifact } from "../storage/types";

interface Props {
  artifacts: Artifact[];
  selectedId: string | null;
  onOpen: (a: Artifact) => void;
  onDelete: (a: Artifact) => void;
  onDownload: (a: Artifact) => void;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString();

export function ArtifactList({
  artifacts,
  selectedId,
  onOpen,
  onDelete,
  onDownload,
}: Props) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const dir = order === "newest" ? -1 : 1;
    return artifacts
      .filter((a) => a.name.toLowerCase().includes(q))
      .sort((a, b) => dir * a.createdAt.localeCompare(b.createdAt));
  }, [artifacts, query, order]);

  return (
    <div className="list">
      <div className="list-tools">
        <input
          type="search"
          placeholder="Tìm theo tên…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm artifact"
        />
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as typeof order)}
          aria-label="Sắp xếp"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>

      {shown.length === 0 && (
        <p className="empty">
          {artifacts.length
            ? "Không có kết quả."
            : "Chưa có artifact. Thêm mới hoặc kéo thả file HTML vào đây."}
        </p>
      )}

      <ul>
        {shown.map((a) => (
          <li
            key={a.id}
            className={a.id === selectedId ? "item active" : "item"}
          >
            <button className="item-main" onClick={() => onOpen(a)} title="Mở">
              <strong>{a.name}</strong>
              <small>
                Tạo: {fmtDate(a.createdAt)}
                <br />
                Sửa: {fmtDate(a.updatedAt)} ·{" "}
                {formatSize(new Blob([a.html]).size)}
              </small>
            </button>
            <div className="item-actions">
              <button onClick={() => onOpen(a)}>Mở</button>
              <button onClick={() => onDownload(a)}>Tải về</button>
              <button className="danger" onClick={() => onDelete(a)}>
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
