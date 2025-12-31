"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  SettingsIcon,
  SparklesIcon,
  HashIcon,
} from "lucide-react";
import { useNotesStore } from "@/stores/notes-store";
import { useFoldersStore } from "@/stores/folders-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";

interface CommandItem {
  id: string;
  type: "note" | "folder" | "action" | "tag";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { notes, createNote, setCurrentNote } = useNotesStore();
  const { folders } = useFoldersStore();
  const { commandPaletteOpen, toggleCommandPalette } = useUIStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset state when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && commandPaletteOpen) {
        toggleCommandPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, toggleCommandPalette]);

  // Build command items
  const items = useMemo<CommandItem[]>(() => {
    const searchQuery = query.toLowerCase();
    const results: CommandItem[] = [];

    // Actions (always show when no query or query matches)
    const actions: CommandItem[] = [
      {
        id: "new-note",
        type: "action",
        title: "Create New Note",
        subtitle: "Start writing a new note",
        icon: <PlusIcon className="h-4 w-4 text-primary-500" />,
        onSelect: async () => {
          const note = await createNote();
          router.push(`/notes/${note.id}`);
          toggleCommandPalette();
        },
      },
      {
        id: "settings",
        type: "action",
        title: "Open Settings",
        subtitle: "Configure app settings and API key",
        icon: <SettingsIcon className="h-4 w-4 text-neutral-500" />,
        onSelect: () => {
          router.push("/settings");
          toggleCommandPalette();
        },
      },
      {
        id: "ai-chat",
        type: "action",
        title: "Open AI Chat",
        subtitle: "Chat with your notes using AI",
        icon: <SparklesIcon className="h-4 w-4 text-accent-500" />,
        onSelect: () => {
          router.push("/chat");
          toggleCommandPalette();
        },
      },
    ];

    // Filter actions
    const filteredActions = actions.filter(
      (a) =>
        !searchQuery ||
        a.title.toLowerCase().includes(searchQuery) ||
        a.subtitle?.toLowerCase().includes(searchQuery)
    );

    // Notes
    const filteredNotes = notes
      .filter(
        (note) =>
          !searchQuery ||
          note.title.toLowerCase().includes(searchQuery) ||
          note.plainText.toLowerCase().includes(searchQuery)
      )
      .slice(0, 10)
      .map((note): CommandItem => ({
        id: `note-${note.id}`,
        type: "note",
        title: note.title || "Untitled",
        subtitle: note.plainText.slice(0, 60) || undefined,
        icon: <FileTextIcon className="h-4 w-4 text-neutral-500" />,
        onSelect: () => {
          setCurrentNote(note.id);
          router.push(`/notes/${note.id}`);
          toggleCommandPalette();
        },
      }));

    // Folders
    const filteredFolders = folders
      .filter(
        (folder) =>
          !searchQuery || folder.name.toLowerCase().includes(searchQuery)
      )
      .slice(0, 5)
      .map((folder): CommandItem => ({
        id: `folder-${folder.id}`,
        type: "folder",
        title: folder.name,
        subtitle: "Folder",
        icon: <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />,
        onSelect: () => {
          // Could navigate to folder view in the future
          toggleCommandPalette();
        },
      }));

    // Tags (extract unique tags from notes)
    const allTags = [...new Set(notes.flatMap((n) => n.tags))];
    const filteredTags = allTags
      .filter((tag) => !searchQuery || tag.toLowerCase().includes(searchQuery))
      .slice(0, 5)
      .map((tag): CommandItem => ({
        id: `tag-${tag}`,
        type: "tag",
        title: `#${tag}`,
        subtitle: `${notes.filter((n) => n.tags.includes(tag)).length} notes`,
        icon: <HashIcon className="h-4 w-4 text-primary-500" />,
        onSelect: () => {
          // Could filter by tag in the future
          toggleCommandPalette();
        },
      }));

    // Combine results with priority
    if (!searchQuery) {
      // Show actions first when no search
      results.push(...filteredActions);
      results.push(...filteredNotes.slice(0, 5));
    } else {
      // Show notes first when searching
      results.push(...filteredNotes);
      results.push(...filteredFolders);
      results.push(...filteredTags);
      results.push(...filteredActions);
    }

    return results;
  }, [query, notes, folders, createNote, router, setCurrentNote, toggleCommandPalette]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        items[selectedIndex]?.onSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, items, selectedIndex]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleCommandPalette}
          className="absolute inset-0 bg-black/40"
        />

        {/* Palette */}
        <div className="relative z-10 flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
              <SearchIcon className="h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, folders, or type a command..."
                className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-neutral-400"
                autoFocus
              />
              <kbd className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-neutral-500">
                  No results found for "{query}"
                </p>
              ) : (
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                        index === selectedIndex
                          ? "bg-primary-50 text-primary-900"
                          : "text-neutral-700 hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex-shrink-0">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-sm text-neutral-500 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <kbd className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                          ↵
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium">↑</kbd>
                  <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium">⌘K</kbd>
                <span>Toggle</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
