"use client";

import { useEffect } from "react";
import { useSettingsStore, type Theme } from "@/stores/settings-store";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

  if (effectiveTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, _hasHydrated } = useSettingsStore();

  // Apply theme when it changes or on hydration
  useEffect(() => {
    if (!_hasHydrated) return;
    applyTheme(theme);
  }, [theme, _hasHydrated]);

  // Listen for system theme changes when using "system" preference
  useEffect(() => {
    if (!_hasHydrated || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, _hasHydrated]);

  // Prevent flash of wrong theme by applying immediately on mount
  useEffect(() => {
    // Apply theme immediately to prevent flash
    const savedTheme = localStorage.getItem("notes-settings-storage");
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          applyTheme(parsed.state.theme);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  return <>{children}</>;
}
