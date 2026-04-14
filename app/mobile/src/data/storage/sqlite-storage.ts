import type { AppState } from "@nju/domain";
import * as SQLite from "expo-sqlite";
import type { AppStateStorage } from "./types";

const SNAPSHOT_VERSION = 1;

export class SqliteAppStateStorage implements AppStateStorage {
  private db: SQLite.SQLiteDatabase | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("nju_timetable.db");
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_snapshot (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          version INTEGER NOT NULL,
          payload TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    }
    return this.db;
  }

  async load(): Promise<AppState | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ payload: string; version: number }>(
      "SELECT payload, version FROM app_snapshot WHERE id = 1",
    );
    if (!row) {
      return null;
    }
    if (row.version !== SNAPSHOT_VERSION) {
      return null;
    }
    return JSON.parse(row.payload) as AppState;
  }

  async save(state: AppState): Promise<void> {
    const db = await this.getDb();
    const payload = JSON.stringify(state);
    await db.runAsync(
      "INSERT OR REPLACE INTO app_snapshot (id, version, payload, updated_at) VALUES (1, ?, ?, ?)",
      [SNAPSHOT_VERSION, payload, new Date().toISOString()],
    );
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    await db.runAsync("DELETE FROM app_snapshot WHERE id = 1");
  }
}
