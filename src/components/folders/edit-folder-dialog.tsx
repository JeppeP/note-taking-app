"use client";

import { useState, useEffect } from "react";
import { FolderIcon } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Button,
  Input,
} from "@/components/ui";
import { useFoldersStore } from "@/stores/folders-store";
import { DEFAULT_FOLDER_COLORS, type Folder } from "@/types";
import { cn } from "@/lib/utils/cn";

interface EditFolderDialogProps {
  open: boolean;
  onClose: () => void;
  folder: Folder | null;
}

export function EditFolderDialog({ open, onClose, folder }: EditFolderDialogProps) {
  const { updateFolder } = useFoldersStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_FOLDER_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
    }
  }, [folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !folder) return;

    setIsLoading(true);
    try {
      await updateFolder(folder.id, {
        name: name.trim(),
        color,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={onClose}>
          <span className="flex items-center gap-2">
            <FolderIcon className="h-5 w-5 text-primary-500" />
            Edit Folder
          </span>
        </DialogHeader>
        <DialogContent>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Folder Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Folder"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Color
            </label>
            <div className="flex gap-2">
              {DEFAULT_FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-primary-500"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
