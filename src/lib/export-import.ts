import { db } from "@/lib/db";
import type { Note, Folder } from "@/types";

export interface ExportData {
  version: number;
  exportedAt: string;
  notes: Note[];
  folders: Folder[];
}

export async function exportAllData(): Promise<ExportData> {
  const notes = await db.notes.toArray();
  const folders = await db.folders.toArray();

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    folders,
  };
}

export async function exportToJSON(): Promise<string> {
  const data = await exportAllData();
  return JSON.stringify(data, null, 2);
}

export async function downloadExport() {
  const json = await exportToJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `notes-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFromJSON(json: string): Promise<{ notes: number; folders: number }> {
  const data: ExportData = JSON.parse(json);

  if (!data.version || !data.notes || !data.folders) {
    throw new Error("Invalid backup file format");
  }

  // Clear existing data
  await db.notes.clear();
  await db.folders.clear();

  // Import folders first (to maintain references)
  if (data.folders.length > 0) {
    // Convert date strings back to Date objects
    const folders = data.folders.map((f) => ({
      ...f,
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    }));
    await db.folders.bulkAdd(folders);
  }

  // Import notes
  if (data.notes.length > 0) {
    const notes = data.notes.map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      updatedAt: new Date(n.updatedAt),
      lastAccessedAt: new Date(n.lastAccessedAt),
    }));
    await db.notes.bulkAdd(notes);
  }

  return {
    notes: data.notes.length,
    folders: data.folders.length,
  };
}

export function exportNoteToMarkdown(note: Note): string {
  let markdown = `# ${note.title}\n\n`;

  if (note.tags.length > 0) {
    markdown += `Tags: ${note.tags.map((t) => `#${t}`).join(" ")}\n\n`;
  }

  markdown += `---\n\n`;
  markdown += note.plainText || "";

  return markdown;
}

export function downloadNoteAsMarkdown(note: Note) {
  const markdown = exportNoteToMarkdown(note);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${note.title || "untitled"}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
