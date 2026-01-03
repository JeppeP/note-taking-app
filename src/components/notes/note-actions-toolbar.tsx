"use client";

import { PinIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

interface NoteActionsToolbarProps {
  isPinned: boolean;
  onTogglePin: () => void;
  onDelete: () => void;
}

export function NoteActionsToolbar({
  isPinned,
  onTogglePin,
  onDelete,
}: NoteActionsToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-8 pt-4 pb-2">
      {/* Pin Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePin}
        title={isPinned ? "Unpin note" : "Pin note"}
        className="h-8 w-8"
      >
        <PinIcon
          className={cn(
            "h-4 w-4 transition-colors",
            isPinned
              ? "fill-primary-500 text-primary-500"
              : "text-neutral-400 hover:text-neutral-600"
          )}
        />
      </Button>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        title="Delete note"
        className="h-8 w-8"
      >
        <TrashIcon className="h-4 w-4 text-neutral-400 hover:text-error transition-colors" />
      </Button>
    </div>
  );
}
