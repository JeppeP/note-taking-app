"use client";

import { MantineProvider } from "@mantine/core";
import { Sidebar, CommandPalette, MobileNav } from "@/components/layout";
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
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <MobileSidebarOverlay />

            <main
              className={cn(
                "flex-1 overflow-hidden transition-all duration-300",
                "pb-16 md:pb-0", // Add bottom padding for mobile nav
                aiPanelOpen && "md:mr-[400px]" // Only apply AI panel margin on desktop
              )}
            >
              {children}
            </main>
          </div>
          <CommandPalette />
          <AIPanel />
          <MobileNav />
        </ErrorBoundary>
      </ToastProvider>
    </MantineProvider>
  );
}

function MobileSidebarOverlay() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={toggleSidebar}
      />
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 md:hidden">
        <Sidebar />
      </div>
    </>
  );
}
