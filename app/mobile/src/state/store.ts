import type { AppState } from "@nju/domain";
import { create } from "zustand";
import { createInitialAppState } from "./bootstrap";

interface AppStore {
  state: AppState;
  hydrated: boolean;
  setHydrated(value: boolean): void;
  replaceState(nextState: AppState): void;
  updateState(recipe: (prev: AppState) => AppState): void;
}

export const useAppStore = create<AppStore>((set) => ({
  state: createInitialAppState(),
  hydrated: false,
  setHydrated(value) {
    set({ hydrated: value });
  },
  replaceState(nextState) {
    set({ state: nextState });
  },
  updateState(recipe) {
    set((current) => ({ state: recipe(current.state) }));
  },
}));
