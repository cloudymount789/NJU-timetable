import type { AppState } from "@nju/domain";

export interface AppStateStorage {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
