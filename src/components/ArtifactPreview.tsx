import { useState } from "react";
import { SANDBOX, openInNewTab } from "../lib/files";
import type { Artifact } from "../storage/types";

interface Props {
  artifact: Artifact;
  onBack: () => void;
  onDownload: (a: Artifact) => void;
  onRename: (a: Artifact) => void;
}

export function ArtifactPreview({
  artifact,
  onBack,
  onDownload,
  onRename,
}: Props) {
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <section className="preview">
      <header className="preview-bar">
        <button
          className="back"
          onClick={onBack}
          aria-label="Quay lại danh sách"
        >
          ← Danh sách
        </button>
        <h2 title={artifact.name}>{artifact.name}</h2>
        <div className="preview-actions">
          <button onClick={() => setReloadKey((k) => k + 1)}>Reload</button>
          <button onClick={() => openInNewTab(artifact)}>Tab mới</button>
          <button onClick={() => onRename(artifact)}>Đổi tên</button>
          <button onClick={() => onDownload(artifact)}>Export .html</button>
        </div>
      </header>
      {/* srcdoc + sandbox không có allow-same-origin: không cần server, artifact bị cô lập khỏi app. */}
      <iframe
        key={`${artifact.id}-${reloadKey}`}
        title={artifact.name}
        sandbox={SANDBOX}
        srcDoc={artifact.html}
      />
    </section>
  );
}
