import type { AppState } from "@nju/domain";
import type { AppStateStorage } from "./types";

export class MemoryAppStateStorage implements AppStateStorage {
  private cache: AppState | null = null;

  async load(): Promise<AppState | null> {
    return this.cache;
  }

  async save(state: AppState): Promise<void> {
    this.cache = state;
  }

  async clear(): Promise<void> {
    this.cache = null;
  }
}
