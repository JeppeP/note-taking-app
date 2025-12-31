"use client";

import { MantineProvider } from "@mantine/core";
import { Sidebar, CommandPalette } from "@/components/layout";
import { AIPanel } from "@/components/ai";
import { ToastProvider } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";
import "@mantine/core/styles.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, aiPanelOpen } = useUIStore();

  return (
    <MantineProvider>
      <ToastProvider>
        <ErrorBoundary>
          <div className="flex h-screen overflow-hidden bg-neutral-50">
            <Sidebar />
            <main
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                aiPanelOpen && "mr-[400px]"
              )}
            >
              {children}
            </main>
          </div>
          <CommandPalette />
          <AIPanel />
        </ErrorBoundary>
      </ToastProvider>
    </MantineProvider>
  );
}
