import Dexie, { type EntityTable } from "dexie";
import type { Note, Folder, ChatMessage } from "@/types";

interface SettingsEntry {
  key: string;
  value: unknown;
}

const db = new Dexie("NotesAppDB") as Dexie & {
  notes: EntityTable<Note, "id">;
  folders: EntityTable<Folder, "id">;
  chatHistory: EntityTable<ChatMessage, "id">;
  settings: EntityTable<SettingsEntry, "key">;
};

db.version(1).stores({
  notes: "id, title, folderId, *tags, isPinned, isArchived, createdAt, updatedAt, lastAccessedAt",
  folders: "id, name, parentId, sortOrder, createdAt",
  chatHistory: "id, timestamp",
  settings: "key",
});

export { db };
export type { SettingsEntry };
