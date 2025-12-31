// Using a generic type for BlockNote content to avoid circular type references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BlockContent = any;

export interface Note {
  id: string;
  title: string;
  content: BlockContent[];
  plainText: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
}

export interface CreateNoteInput {
  title?: string;
  folderId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: BlockContent[];
  plainText?: string;
  folderId?: string | null;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}
