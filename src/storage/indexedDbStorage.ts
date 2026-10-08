import localforage from "localforage";
import { sanitizeName } from "../lib/filename";
import type { Artifact, ArtifactStorage } from "./types";

// Chỉ dùng IndexedDB (không fallback sang localStorage vì artifact có thể lớn).
const db = localforage.createInstance({
  name: "ai-artifact-viewer",
  storeName: "artifacts",
  driver: localforage.INDEXEDDB,
});

// crypto.randomUUID chỉ có trong secure context (https/localhost); fallback khi mở qua IP LAN.
const newId = () =>
  crypto.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const indexedDbStorage: ArtifactStorage = {
  async listArtifacts() {
    const list: Artifact[] = [];
    await db.iterate<Artifact, void>((a) => {
      list.push(a);
    });
    return list;
  },

  getArtifact: (id) => db.getItem<Artifact>(id),

  saveArtifact({ name, html }) {
    const now = new Date().toISOString();
    const artifact: Artifact = {
      id: newId(),
      name: sanitizeName(name),
      html,
      createdAt: now,
      updatedAt: now,
    };
    return db.setItem(artifact.id, artifact);
  },

  deleteArtifact: (id) => db.removeItem(id),

  async updateArtifact(id, data) {
    const current = await db.getItem<Artifact>(id);
    if (!current) throw new Error(`Artifact ${id} không tồn tại`);
    const next: Artifact = {
      ...current,
      ...data,
      name: data.name === undefined ? current.name : sanitizeName(data.name),
      updatedAt: new Date().toISOString(),
    };
    return db.setItem(id, next);
  },
};
