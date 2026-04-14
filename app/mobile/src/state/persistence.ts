import type { AppState } from "@nju/domain";
import { createDefaultAppStorage, type AppStateStorage } from "@/data/storage";
import { useAppStore } from "./store";

const defaultStorage = createDefaultAppStorage();

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let lastPersistedJson: string | null = null;

function schedulePersist(storage: AppStateStorage, state: AppState): void {
  const nextJson = JSON.stringify(state);
  if (nextJson === lastPersistedJson) {
    return;
  }
  if (persistTimer) {
    clearTimeout(persistTimer);
  }
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void storage
      .save(state)
      .then(() => {
        lastPersistedJson = nextJson;
      })
      .catch((error: unknown) => {
        console.error("persistAppState failed", error);
      });
  }, 250);
}

export function startPersistSubscription(storage: AppStateStorage = defaultStorage): () => void {
  return useAppStore.subscribe((store) => {
    if (!store.hydrated) {
      return;
    }
    schedulePersist(storage, store.state);
  });
}

export async function hydrateAppState(storage: AppStateStorage = defaultStorage): Promise<void> {
  const loaded = await storage.load();
  if (loaded) {
    useAppStore.getState().replaceState(loaded);
    lastPersistedJson = JSON.stringify(loaded);
  }
  useAppStore.getState().setHydrated(true);
}

export async function persistAppState(storage: AppStateStorage = defaultStorage): Promise<void> {
  const state: AppState = useAppStore.getState().state;
  await storage.save(state);
  lastPersistedJson = JSON.stringify(state);
}
