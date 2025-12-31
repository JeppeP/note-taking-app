"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import type { Note, CreateNoteInput, UpdateNoteInput } from "@/types";

interface NotesState {
  notes: Note[];
  currentNoteId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadNotes: () => Promise<void>;
  createNote: (input?: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (id: string | null) => void;
  getCurrentNote: () => Note | undefined;
  getRecentNotes: (limit?: number) => Note[];
  searchNotes: (query: string) => Promise<Note[]>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNoteId: null,
  isLoading: false,
  error: null,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await db.notes
        .orderBy("updatedAt")
        .reverse()
        .toArray();
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: "Failed to load notes", isLoading: false });
      console.error("Failed to load notes:", error);
    }
  },

  createNote: async (input?: CreateNoteInput) => {
    const now = new Date();
    const note: Note = {
      id: nanoid(),
      title: input?.title || "Untitled",
      content: [],
      plainText: "",
      folderId: input?.folderId || null,
      tags: [],
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    };

    await db.notes.add(note);
    set((state) => ({
      notes: [note, ...state.notes],
      currentNoteId: note.id,
    }));

    return note;
  },

  updateNote: async (id: string, input: UpdateNoteInput) => {
    const updates = {
      ...input,
      updatedAt: new Date(),
    };

    await db.notes.update(id, updates);
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
    }));
  },

  deleteNote: async (id: string) => {
    await db.notes.delete(id);
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
    }));
  },

  setCurrentNote: (id: string | null) => {
    set({ currentNoteId: id });
    if (id) {
      // Update lastAccessedAt
      db.notes.update(id, { lastAccessedAt: new Date() });
    }
  },

  getCurrentNote: () => {
    const { notes, currentNoteId } = get();
    return notes.find((note) => note.id === currentNoteId);
  },

  getRecentNotes: (limit = 10) => {
    const { notes } = get();
    return [...notes]
      .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
      .slice(0, limit);
  },

  searchNotes: async (query: string) => {
    if (!query || query.length < 2) return [];

    const searchTerms = query.toLowerCase().split(" ");
    const { notes } = get();

    return notes
      .filter((note) => {
        const searchable = `${note.title} ${note.plainText}`.toLowerCase();
        return searchTerms.every((term) => searchable.includes(term));
      })
      .sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aInTitle = searchTerms.some((t) => aTitle.includes(t));
        const bInTitle = searchTerms.some((t) => bTitle.includes(t));
        if (aInTitle && !bInTitle) return -1;
        if (!aInTitle && bInTitle) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
  },
}));
