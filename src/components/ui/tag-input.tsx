"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { XIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add tag...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2",
        "focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20",
        "transition-colors duration-200",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-sm text-primary-700"
        >
          #{tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="rounded-full p-0.5 hover:bg-primary-200 transition-colors"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] border-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}
