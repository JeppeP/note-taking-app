"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileTextIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui";
import { useNotesStore } from "@/stores/notes-store";

export default function NotesPage() {
  const router = useRouter();
  const { notes, loadNotes, createNote, isLoading } = useNotesStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleNewNote = async () => {
    const note = await createNote();
    router.push(`/notes/${note.id}`);
  };

  // If there are notes, redirect to the most recent one
  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      const mostRecent = [...notes].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      )[0];
      router.push(`/notes/${mostRecent.id}`);
    }
  }, [notes, isLoading, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <div className="rounded-full bg-gradient-to-br from-primary-100 to-accent-100 p-6">
            <FileTextIcon className="h-12 w-12 text-primary-500" />
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-2 text-2xl font-semibold text-neutral-900"
        >
          Welcome to Notes
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 text-neutral-500"
        >
          Create your first note to get started
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="primary" className="gradient-brand" onClick={handleNewNote}>
            <PlusIcon className="h-4 w-4" />
            Create Note
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
