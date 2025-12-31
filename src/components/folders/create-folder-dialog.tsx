"use client";

import { useState } from "react";
import { FolderPlusIcon } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  Button,
  Input,
} from "@/components/ui";
import { useFoldersStore } from "@/stores/folders-store";
import { DEFAULT_FOLDER_COLORS } from "@/types";
import { cn } from "@/lib/utils/cn";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export function CreateFolderDialog({ open, onClose, parentId }: CreateFolderDialogProps) {
  const { createFolder } = useFoldersStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_FOLDER_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createFolder({
        name: name.trim(),
        parentId: parentId || null,
        color,
      });
      setName("");
      setColor(DEFAULT_FOLDER_COLORS[0]);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setColor(DEFAULT_FOLDER_COLORS[0]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader onClose={handleClose}>
          <span className="flex items-center gap-2">
            <FolderPlusIcon className="h-5 w-5 text-primary-500" />
            Create Folder
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
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
