"use client";

import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Button,
} from "@/components/ui";
import { useFoldersStore } from "@/stores/folders-store";
import type { Folder } from "@/types";

interface DeleteFolderDialogProps {
  open: boolean;
  onClose: () => void;
  folder: Folder | null;
}

export function DeleteFolderDialog({ open, onClose, folder }: DeleteFolderDialogProps) {
  const { deleteFolder } = useFoldersStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!folder) return;

    setIsLoading(true);
    try {
      await deleteFolder(folder.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <span className="flex items-center gap-2 text-error">
          <AlertTriangleIcon className="h-5 w-5" />
          Delete Folder
        </span>
      </DialogHeader>
      <DialogContent>
        <p className="text-neutral-600">
          Are you sure you want to delete <strong>{folder?.name}</strong>?
        </p>
        <p className="text-sm text-neutral-500">
          All subfolders will also be deleted. Notes in this folder will be moved to
          the root level.
        </p>
      </DialogContent>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
