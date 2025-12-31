"use client";

import { useMemo, useRef } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { debounce } from "@/lib/utils/debounce";
import type { BlockContent } from "@/types";

interface NoteEditorProps {
  initialContent?: BlockContent[];
  onChange?: (content: BlockContent[], plainText: string) => void;
  editable?: boolean;
}

export function NoteEditor({
  initialContent,
  onChange,
  editable = true,
}: NoteEditorProps) {
  const isInitialMount = useRef(true);

  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  // Debounced onChange handler
  const debouncedOnChange = useMemo(
    () =>
      debounce((blocks: BlockContent[]) => {
        if (onChange) {
          // Extract plain text from blocks
          const plainText = extractPlainText(blocks);
          onChange(blocks, plainText);
        }
      }, 300),
    [onChange]
  );

  return (
    <div className="bn-container min-h-[500px]">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={() => {
          if (!isInitialMount.current) {
            debouncedOnChange(editor.document);
          }
          isInitialMount.current = false;
        }}
        theme="light"
        className="min-h-[500px]"
      />
    </div>
  );
}

// Helper function to extract plain text from blocks
function extractPlainText(blocks: BlockContent[]): string {
  const textParts: string[] = [];

  function processBlock(block: BlockContent) {
    if (block.content && Array.isArray(block.content)) {
      for (const item of block.content) {
        if (typeof item === "object" && "text" in item) {
          textParts.push(item.text as string);
        }
      }
    }
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        processBlock(child);
      }
    }
  }

  for (const block of blocks) {
    processBlock(block);
  }

  return textParts.join(" ").trim();
}
