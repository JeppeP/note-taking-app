"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  SearchIcon,
  FolderIcon,
  FolderPlusIcon,
  SettingsIcon,
  SparklesIcon,
  FileTextIcon,
  ChevronRightIcon,
  PinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { Button, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui";
import { CreateFolderDialog, EditFolderDialog, DeleteFolderDialog } from "@/components/folders";
import { useNotesStore } from "@/stores/notes-store";
import { useFoldersStore, type FolderWithChildren } from "@/stores/folders-store";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils/cn";
import type { Folder, UnifiedListItem } from "@/types";

export function Sidebar() {
  const router = useRouter();
  const { notes, loadNotes, createNote, currentNoteId, setCurrentNote, updateNote } = useNotesStore();
  const { folders, loadFolders, getFolderTree, getUnifiedList } = useFoldersStore();
  const { expandedFolders, toggleFolder, toggleAIPanel, toggleCommandPalette } = useUIStore();

  // Dialog state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, [loadNotes, loadFolders]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  const handleNewNote = async () => {
    const note = await createNote();
    router.push(`/notes/${note.id}`);
  };

  const handleNoteClick = (noteId: string) => {
    setCurrentNote(noteId);
    router.push(`/notes/${noteId}`);
  };

  const handleEditFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setEditFolderOpen(true);
  };

  const handleDeleteFolder = (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteFolderOpen(true);
  };

  const handleCreateSubfolder = (parentId: string) => {
    setCreateFolderParentId(parentId);
    setCreateFolderOpen(true);
  };

  const handleMoveNote = async (noteId: string, folderId: string | null) => {
    const note = notes.find((n) => n.id === noteId);
    if (note && note.folderId !== folderId) {
      await updateNote(noteId, { folderId });
    }
  };

  const pinnedNotes = notes.filter((n) => n.isPinned && !n.isArchived);
  const unifiedList = getUnifiedList(notes);

  // Note: Visibility is controlled by parent layout via CSS breakpoints
  // Desktop: always visible (hidden md:block wrapper)
  // Mobile: controlled by MobileSidebarOverlay component

  return (
    <>
      <aside className="flex h-full w-[280px] flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Notes
          </h1>
          <Button variant="ghost" size="icon" onClick={toggleAIPanel} title="AI Assistant">
            <SparklesIcon className="h-4 w-4 text-accent-500" />
          </Button>
        </div>

        {/* New Note Button */}
        <div className="px-3 pb-3">
          <Button variant="primary" className="w-full gradient-brand" onClick={handleNewNote}>
            <PlusIcon className="h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <button
            onClick={toggleCommandPalette}
            className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <SearchIcon className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 flex items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <PinIcon className="h-3 w-3" />
                Pinned
              </h3>
              <ul className="space-y-1">
                {pinnedNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isActive={currentNoteId === note.id}
                    onClick={() => handleNoteClick(note.id)}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Unified Notes List */}
          <UnifiedListSection
            unifiedList={unifiedList}
            notes={notes}
            currentNoteId={currentNoteId}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            onNoteClick={handleNoteClick}
            onEditFolder={handleEditFolder}
            onDeleteFolder={handleDeleteFolder}
            onCreateSubfolder={handleCreateSubfolder}
            onMoveNote={handleMoveNote}
            onCreateFolder={() => {
              setCreateFolderParentId(null);
              setCreateFolderOpen(true);
            }}
          />
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/settings")}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => {
          setCreateFolderOpen(false);
          setCreateFolderParentId(null);
        }}
        parentId={createFolderParentId}
      />
      <EditFolderDialog
        open={editFolderOpen}
        onClose={() => {
          setEditFolderOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
      />
      <DeleteFolderDialog
        open={deleteFolderOpen}
        onClose={() => {
          setDeleteFolderOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
      />
    </>
  );
}

interface NoteItemProps {
  note: { id: string; title: string; updatedAt: Date };
  isActive: boolean;
  onClick: () => void;
}

function NoteItem({ note, isActive, onClick }: NoteItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("noteId", note.id);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback during drag
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
          isActive
            ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        )}
      >
        <FileTextIcon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate flex-1">{note.title || "Untitled"}</span>
      </button>
    </li>
  );
}

interface UnifiedListSectionProps {
  unifiedList: UnifiedListItem[];
  notes: Array<{ id: string; title: string; folderId: string | null; updatedAt: Date }>;
  currentNoteId: string | null;
  expandedFolders: string[];
  toggleFolder: (id: string) => void;
  onNoteClick: (id: string) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onCreateSubfolder: (parentId: string) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
  onCreateFolder: () => void;
}

function UnifiedListSection({
  unifiedList,
  notes,
  currentNoteId,
  expandedFolders,
  toggleFolder,
  onNoteClick,
  onEditFolder,
  onDeleteFolder,
  onCreateSubfolder,
  onMoveNote,
  onCreateFolder,
}: UnifiedListSectionProps) {
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOverRoot(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverRoot(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("noteId");
    if (noteId) {
      // Remove from folder by setting folderId to null
      onMoveNote(noteId, null);
    }
    setIsDragOverRoot(false);
  };

  return (
    <div
      className={cn(
        "mb-4 rounded-lg transition-colors",
        isDragOverRoot && "bg-primary-50 ring-2 ring-primary-300 dark:bg-primary-500/20"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {isDragOverRoot ? "Drop to remove from folder" : "Notes"}
        </h3>
        <button
          onClick={onCreateFolder}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          title="Create folder"
        >
          <FolderPlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      {unifiedList.length > 0 ? (
        <ul className="space-y-1">
          {unifiedList.map((item) =>
            item.type === "folder" ? (
              <FolderItem
                key={item.folder.id}
                folder={item.folder}
                notes={notes}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                currentNoteId={currentNoteId}
                onNoteClick={onNoteClick}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
                onCreateSubfolder={onCreateSubfolder}
                onMoveNote={onMoveNote}
              />
            ) : (
              <NoteItem
                key={item.note.id}
                note={item.note}
                isActive={currentNoteId === item.note.id}
                onClick={() => onNoteClick(item.note.id)}
              />
            )
          )}
        </ul>
      ) : (
        <p className="px-2 text-sm text-neutral-400">No notes yet</p>
      )}
    </div>
  );
}

interface FolderItemProps {
  folder: FolderWithChildren;
  notes: Array<{ id: string; title: string; folderId: string | null; updatedAt: Date }>;
  expandedFolders: string[];
  toggleFolder: (id: string) => void;
  currentNoteId: string | null;
  onNoteClick: (id: string) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onCreateSubfolder: (parentId: string) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
  depth?: number;
}

function FolderItem({
  folder,
  notes,
  expandedFolders,
  toggleFolder,
  currentNoteId,
  onNoteClick,
  onEditFolder,
  onDeleteFolder,
  onCreateSubfolder,
  onMoveNote,
  depth = 0,
}: FolderItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isExpanded = expandedFolders.includes(folder.id);
  const folderNotes = notes.filter((n) => n.folderId === folder.id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const noteId = e.dataTransfer.getData("noteId");
    if (noteId) {
      onMoveNote(noteId, folder.id);
    }
    setIsDragOver(false);
  };

  return (
    <li
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg text-sm text-neutral-600 hover:bg-neutral-100 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800",
          isDragOver && "bg-primary-50 ring-2 ring-primary-300 dark:bg-primary-500/20"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <button
          onClick={() => toggleFolder(folder.id)}
          className="flex flex-1 items-center gap-2 py-1.5 pr-1"
        >
          <ChevronRightIcon
            className={cn(
              "h-3 w-3 text-neutral-400 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          <FolderIcon
            className="h-4 w-4 flex-shrink-0"
            style={{ color: folder.color }}
          />
          <span className="truncate flex-1 text-left">{folder.name}</span>
          <span className="text-xs text-neutral-400">{folderNotes.length}</span>
        </button>
        <DropdownMenu
          trigger={
            <button className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 transition-all dark:hover:bg-neutral-700">
              <MoreHorizontalIcon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            </button>
          }
          align="right"
        >
          <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id)}>
            <FolderPlusIcon className="h-4 w-4" />
            Add subfolder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEditFolder(folder)}>
            <PencilIcon className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger" onClick={() => onDeleteFolder(folder)}>
            <TrashIcon className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mt-1 space-y-1 overflow-hidden"
          >
            {folder.children.map((child, index) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <FolderItem
                  folder={child}
                  notes={notes}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  currentNoteId={currentNoteId}
                  onNoteClick={onNoteClick}
                  onEditFolder={onEditFolder}
                  onDeleteFolder={onDeleteFolder}
                  onCreateSubfolder={onCreateSubfolder}
                  onMoveNote={onMoveNote}
                  depth={depth + 1}
                />
              </motion.div>
            ))}
            {folderNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (folder.children.length + index) * 0.03 }}
              >
                <li
                  style={{ paddingLeft: `${(depth + 1) * 12 + 4}px` }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("noteId", note.id);
                    e.dataTransfer.effectAllowed = "move";
                    (e.target as HTMLElement).style.opacity = "0.5";
                  }}
                  onDragEnd={(e) => {
                    (e.target as HTMLElement).style.opacity = "1";
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <button
                    onClick={() => onNoteClick(note.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      currentNoteId === note.id
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                    )}
                  >
                    <FileTextIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1">{note.title || "Untitled"}</span>
                  </button>
                </li>
              </motion.div>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
