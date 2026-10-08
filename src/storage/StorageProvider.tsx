import { createContext, useContext, type ReactNode } from "react";
import { indexedDbStorage } from "./indexedDbStorage";
import type { ArtifactStorage } from "./types";

const StorageContext = createContext<ArtifactStorage>(indexedDbStorage);

/** Đổi backend lưu trữ (vd. Capacitor Filesystem) bằng cách truyền prop `storage`. */
export function StorageProvider({
  storage = indexedDbStorage,
  children,
}: {
  storage?: ArtifactStorage;
  children: ReactNode;
}) {
  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export const useStorage = () => useContext(StorageContext);
