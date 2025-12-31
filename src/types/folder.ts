export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderInput {
  name: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
}

export interface UpdateFolderInput {
  name?: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

export const DEFAULT_FOLDER_COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

export const DEFAULT_FOLDER_ICONS = [
  "folder",
  "book",
  "briefcase",
  "code",
  "file-text",
  "heart",
  "star",
  "zap",
];
