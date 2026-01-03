"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AISettings } from "@/types";

export type Theme = "light" | "dark" | "system";

interface SettingsState {
  aiSettings: AISettings;
  theme: Theme;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAPIKey: (key: string) => void;
  hasAPIKey: () => boolean;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setTheme: (theme: Theme) => void;
}

const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  temperature: 0.7,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      aiSettings: DEFAULT_AI_SETTINGS,
      theme: "system" as Theme,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setAPIKey: (key: string) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, apiKey: key },
        })),

      hasAPIKey: () => {
        const { aiSettings } = get();
        return aiSettings.apiKey.length > 0;
      },

      setModel: (model: string) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, model },
        })),

      setTemperature: (temp: number) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, temperature: Math.max(0, Math.min(2, temp)) },
        })),

      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: "notes-settings-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiSettings: state.aiSettings,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
