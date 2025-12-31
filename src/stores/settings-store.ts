"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AISettings } from "@/types";

interface SettingsState {
  aiSettings: AISettings;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAPIKey: (key: string) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  hasAPIKey: () => boolean;
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
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setAPIKey: (key: string) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, apiKey: key },
        })),

      setModel: (model: string) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, model },
        })),

      setTemperature: (temp: number) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, temperature: Math.max(0, Math.min(2, temp)) },
        })),

      hasAPIKey: () => {
        const { aiSettings } = get();
        return aiSettings.apiKey.length > 0;
      },
    }),
    {
      name: "notes-settings-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiSettings: state.aiSettings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
