import { useCallback, useEffect, useState } from "react";
import { useStorage } from "../storage/StorageProvider";
import type { Artifact, ArtifactInput } from "../storage/types";

// ponytail: giữ toàn bộ html của mọi artifact trong state; nếu có hàng nghìn artifact lớn thì tách metadata/nội dung.
export function useArtifacts() {
  const storage = useStorage();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storage
      .listArtifacts()
      .then(setArtifacts)
      .catch((e) => setError(`Không đọc được dữ liệu: ${e}`))
      .finally(() => setLoading(false));
  }, [storage]);

  const add = useCallback(
    async (data: ArtifactInput) => {
      const a = await storage.saveArtifact(data);
      setArtifacts((list) => [...list, a]);
      return a;
    },
    [storage],
  );

  const update = useCallback(
    async (id: string, data: Partial<ArtifactInput>) => {
      const a = await storage.updateArtifact(id, data);
      setArtifacts((list) => list.map((x) => (x.id === id ? a : x)));
      return a;
    },
    [storage],
  );

  const remove = useCallback(
    async (id: string) => {
      await storage.deleteArtifact(id);
      setArtifacts((list) => list.filter((x) => x.id !== id));
    },
    [storage],
  );

  return { artifacts, loading, error, add, update, remove };
}
