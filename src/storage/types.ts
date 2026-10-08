export interface Artifact {
  id: string;
  name: string;
  html: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtifactInput = Pick<Artifact, "name" | "html">;

/** Mọi backend lưu trữ (IndexedDB, Capacitor Filesystem, SQLite...) đều implement interface này. */
export interface ArtifactStorage {
  listArtifacts(): Promise<Artifact[]>;
  getArtifact(id: string): Promise<Artifact | null>;
  saveArtifact(data: ArtifactInput): Promise<Artifact>;
  deleteArtifact(id: string): Promise<void>;
  updateArtifact(id: string, data: Partial<ArtifactInput>): Promise<Artifact>;
}
