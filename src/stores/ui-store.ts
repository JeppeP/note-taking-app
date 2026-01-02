"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  expandedFolders: string[];

  // AI Panel
  aiPanelOpen: boolean;
  aiPanelTab: "write" | "chat" | "voice";

  // Command Palette
  commandPaletteOpen: boolean;

  // Search
  searchQuery: string;

  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  toggleFolder: (folderId: string) => void;
  toggleAIPanel: () => void;
  setAIPanelTab: (tab: "write" | "chat" | "voice") => void;
  toggleCommandPalette: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      // sidebarOpen only controls mobile overlay; desktop sidebar is always visible via CSS
      sidebarOpen: false,
      sidebarWidth: 280,
      expandedFolders: [],
      aiPanelOpen: false,
      aiPanelTab: "write",
      commandPaletteOpen: false,
      searchQuery: "",
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarWidth: (width: number) => set({ sidebarWidth: Math.max(200, Math.min(400, width)) }),

      toggleFolder: (folderId: string) =>
        set((state) => ({
          expandedFolders: state.expandedFolders.includes(folderId)
            ? state.expandedFolders.filter((id) => id !== folderId)
            : [...state.expandedFolders, folderId],
        })),

      toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),

      setAIPanelTab: (tab) => set({ aiPanelTab: tab }),

      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

      setSearchQuery: (query: string) => set({ searchQuery: query }),
    }),
    {
      name: "notes-ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist sidebarOpen - it only controls mobile overlay
        sidebarWidth: state.sidebarWidth,
        expandedFolders: state.expandedFolders,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
