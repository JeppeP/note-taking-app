"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, FileTextIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui";
import { useNotesStore } from "@/stores/notes-store";
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";

export default function SearchPage() {
  const router = useRouter();
  const { searchNotes, setCurrentNote } = useNotesStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchNotes>>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search on query change
  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const searchResults = await searchNotes(query);
      setResults(searchResults);
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(search, 200);
    return () => clearTimeout(debounceTimer);
  }, [query, searchNotes]);

  const handleNoteClick = (noteId: string) => {
    setCurrentNote(noteId);
    router.push(`/notes/${noteId}`);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-primary-200 text-primary-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-10 pr-10 text-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6">
          {/* Search hint */}
          {query.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <p className="text-neutral-500">
                Start typing to search through your notes
              </p>
            </div>
          )}

          {/* Loading */}
          {isSearching && query.length >= 2 && (
            <p className="text-sm text-neutral-500">Searching...</p>
          )}

          {/* No results */}
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">No notes found for "{query}"</p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-500 mb-4">
                {results.length} {results.length === 1 ? "result" : "results"} found
              </p>
              {results.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="w-full text-left rounded-xl border border-neutral-200 bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <FileTextIcon className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 mb-1">
                        {highlightMatch(note.title || "Untitled", query)}
                      </h3>
                      {note.plainText && (
                        <p className="text-sm text-neutral-500 line-clamp-2">
                          {highlightMatch(note.plainText.slice(0, 200), query)}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 mt-2">
                        Updated {format(note.updatedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
