"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import type { Folder, CreateFolderInput, UpdateFolderInput, DEFAULT_FOLDER_COLORS } from "@/types";

interface FoldersState {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFolders: () => Promise<void>;
  createFolder: (input: CreateFolderInput) => Promise<Folder>;
  updateFolder: (id: string, input: UpdateFolderInput) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  getFolderTree: () => FolderWithChildren[];
  getFolder: (id: string) => Folder | undefined;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
}

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  isLoading: false,
  error: null,

  loadFolders: async () => {
    set({ isLoading: true, error: null });
    try {
      const folders = await db.folders
        .orderBy("sortOrder")
        .toArray();
      set({ folders, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load folders", isLoading: false });
      console.error("Failed to load folders:", error);
    }
  },

  createFolder: async (input: CreateFolderInput) => {
    const { folders } = get();
    const now = new Date();

    // Get max sort order for root or sibling folders
    const siblings = folders.filter((f) => f.parentId === (input.parentId || null));
    const maxSortOrder = siblings.length > 0
      ? Math.max(...siblings.map((f) => f.sortOrder))
      : 0;

    const folder: Folder = {
      id: nanoid(),
      name: input.name,
      parentId: input.parentId || null,
      color: input.color || "#8B5CF6",
      icon: input.icon || "folder",
      sortOrder: maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.folders.add(folder);
    set((state) => ({
      folders: [...state.folders, folder],
    }));

    return folder;
  },

  updateFolder: async (id: string, input: UpdateFolderInput) => {
    const updates = {
      ...input,
      updatedAt: new Date(),
    };

    await db.folders.update(id, updates);
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    }));
  },

  deleteFolder: async (id: string) => {
    // Also delete child folders recursively
    const { folders } = get();
    const toDelete = new Set<string>();

    const collectChildren = (parentId: string) => {
      toDelete.add(parentId);
      folders
        .filter((f) => f.parentId === parentId)
        .forEach((f) => collectChildren(f.id));
    };
    collectChildren(id);

    // Delete all collected folders
    await db.folders.bulkDelete([...toDelete]);

    // Move notes from deleted folders to root
    const notesInDeletedFolders = await db.notes
      .filter((note) => note.folderId !== null && toDelete.has(note.folderId))
      .toArray();

    for (const note of notesInDeletedFolders) {
      await db.notes.update(note.id, { folderId: null });
    }

    set((state) => ({
      folders: state.folders.filter((folder) => !toDelete.has(folder.id)),
    }));
  },

  getFolderTree: () => {
    const { folders } = get();

    const buildTree = (parentId: string | null): FolderWithChildren[] => {
      return folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((folder) => ({
          ...folder,
          children: buildTree(folder.id),
        }));
    };

    return buildTree(null);
  },

  getFolder: (id: string) => {
    return get().folders.find((f) => f.id === id);
  },
}));
