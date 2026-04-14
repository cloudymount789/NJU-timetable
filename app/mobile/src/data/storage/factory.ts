import { Platform } from "react-native";
import type { AppStateStorage } from "./types";
import { MemoryAppStateStorage } from "./memory-storage";
import { SqliteAppStateStorage } from "./sqlite-storage";

export function createDefaultAppStorage(): AppStateStorage {
  if (Platform.OS === "web") {
    return new MemoryAppStateStorage();
  }
  return new SqliteAppStateStorage();
}
