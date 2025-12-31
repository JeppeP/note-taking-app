"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrashIcon,
  PinIcon,
  FolderIcon,
  SparklesIcon,
  ChevronDownIcon,
} from "lucide-react";
import { Button, TagInput, DropdownMenu, DropdownMenuItem } from "@/components/ui";
import { NoteEditor } from "@/components/editor";
import { useNotesStore } from "@/stores/notes-store";
import { useFoldersStore } from "@/stores/folders-store";
import { useUIStore } from "@/stores/ui-store";
import { useSettingsStore } from "@/stores/settings-store";
import { cn } from "@/lib/utils/cn";
import type { BlockContent } from "@/types";
import { format } from "date-fns";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.noteId as string;

  const { notes, loadNotes, updateNote, deleteNote, setCurrentNote } = useNotesStore();
  const { folders, loadFolders } = useFoldersStore();
  const { toggleAIPanel } = useUIStore();
  const { hasAPIKey } = useSettingsStore();

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTags, setShowTags] = useState(false);

  const note = notes.find((n) => n.id === noteId);
  const currentFolder = note?.folderId ? folders.find((f) => f.id === note.folderId) : null;

  // Load notes and set current note
  useEffect(() => {
    loadNotes();
    loadFolders();
    setCurrentNote(noteId);
    return () => setCurrentNote(null);
  }, [loadNotes, loadFolders, noteId, setCurrentNote]);

  // Sync title from note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
    }
  }, [note?.id]);

  // Handle title change with debounce
  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle);
      if (note && newTitle !== note.title) {
        setIsSaving(true);
        await updateNote(noteId, { title: newTitle || "Untitled" });
        setLastSaved(new Date());
        setIsSaving(false);
      }
    },
    [note, noteId, updateNote]
  );

  // Handle content change (auto-save)
  const handleContentChange = useCallback(
    async (content: BlockContent[], plainText: string) => {
      if (note) {
        setIsSaving(true);
        await updateNote(noteId, { content, plainText });
        setLastSaved(new Date());
        setIsSaving(false);
      }
    },
    [note, noteId, updateNote]
  );

  // Handle tags change
  const handleTagsChange = useCallback(
    async (tags: string[]) => {
      if (note) {
        setIsSaving(true);
        await updateNote(noteId, { tags });
        setLastSaved(new Date());
        setIsSaving(false);
      }
    },
    [note, noteId, updateNote]
  );

  // Handle folder change
  const handleFolderChange = useCallback(
    async (folderId: string | null) => {
      if (note) {
        setIsSaving(true);
        await updateNote(noteId, { folderId });
        setLastSaved(new Date());
        setIsSaving(false);
      }
    },
    [note, noteId, updateNote]
  );

  // Handle delete
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote(noteId);
      router.push("/notes");
    }
  };

  // Handle pin toggle
  const handleTogglePin = async () => {
    if (note) {
      await updateNote(noteId, { isPinned: !note.isPinned });
    }
  };

  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-neutral-500">Note not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Folder selector */}
          <DropdownMenu
            trigger={
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors">
                <FolderIcon
                  className="h-4 w-4"
                  style={{ color: currentFolder?.color || "#9CA3AF" }}
                />
                <span>{currentFolder?.name || "No folder"}</span>
                <ChevronDownIcon className="h-3 w-3 text-neutral-400" />
              </button>
            }
          >
            <DropdownMenuItem onClick={() => handleFolderChange(null)}>
              <FolderIcon className="h-4 w-4 text-neutral-400" />
              No folder
            </DropdownMenuItem>
            {folders.map((folder) => (
              <DropdownMenuItem
                key={folder.id}
                onClick={() => handleFolderChange(folder.id)}
              >
                <FolderIcon className="h-4 w-4" style={{ color: folder.color }} />
                {folder.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenu>

          {/* Save status */}
          <span className="text-xs text-neutral-400">
            {isSaving ? (
              "Saving..."
            ) : lastSaved ? (
              `Saved ${format(lastSaved, "h:mm a")}`
            ) : (
              "All changes saved"
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAIPanel}
            className={cn(!hasAPIKey() && "opacity-50")}
            title={hasAPIKey() ? "AI Assistant" : "Set up API key in settings"}
          >
            <SparklesIcon className="h-4 w-4 text-accent-500" />
            AI
          </Button>

          {/* Pin */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTogglePin}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <PinIcon
              className={cn(
                "h-4 w-4",
                note.isPinned ? "fill-primary-500 text-primary-500" : "text-neutral-400"
              )}
            />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Delete note"
          >
            <TrashIcon className="h-4 w-4 text-neutral-400 hover:text-error" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto max-w-3xl px-6 py-8"
        >
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mb-4 w-full border-none bg-transparent text-4xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
          />

          {/* Tags */}
          <div className="mb-6">
            {note.tags.length > 0 || showTags ? (
              <TagInput
                tags={note.tags}
                onChange={handleTagsChange}
                placeholder="Add tags..."
              />
            ) : (
              <button
                onClick={() => setShowTags(true)}
                className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                + Add tags
              </button>
            )}
          </div>

          {/* Editor */}
          <NoteEditor
            key={note.id}
            initialContent={note.content}
            onChange={handleContentChange}
          />
        </motion.div>
      </div>
    </div>
  );
}
