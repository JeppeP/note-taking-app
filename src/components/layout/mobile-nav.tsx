"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileTextIcon,
  SearchIcon,
  SparklesIcon,
  SettingsIcon,
  MenuIcon,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  isActive?: boolean;
}

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCommandPalette, toggleAIPanel, toggleSidebar, sidebarOpen } = useUIStore();

  const navItems: NavItem[] = [
    {
      icon: MenuIcon,
      label: "Menu",
      action: toggleSidebar,
      isActive: sidebarOpen,
    },
    {
      icon: FileTextIcon,
      label: "Notes",
      action: () => router.push("/notes"),
      isActive: pathname?.startsWith("/notes") && !sidebarOpen,
    },
    {
      icon: SearchIcon,
      label: "Search",
      action: toggleCommandPalette,
    },
    {
      icon: SparklesIcon,
      label: "AI",
      action: toggleAIPanel,
    },
    {
      icon: SettingsIcon,
      label: "Settings",
      action: () => router.push("/settings"),
      isActive: pathname === "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-lg pb-safe md:hidden dark:border-neutral-700 dark:bg-neutral-900/95">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={item.action}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
        item.isActive
          ? "text-primary-600 dark:text-primary-400"
          : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{item.label}</span>
    </motion.button>
  );
}
