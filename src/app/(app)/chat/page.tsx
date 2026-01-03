"use client";

import { useRef, useEffect } from "react";
import { useChat } from "ai/react";
import {
  SparklesIcon,
  SendIcon,
  Loader2Icon,
  MessageSquareIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotesStore } from "@/stores/notes-store";
import { cn } from "@/lib/utils/cn";

export default function ChatPage() {
  const { aiSettings, hasAPIKey } = useSettingsStore();
  const { notes } = useNotesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build note context for chat
  const noteContext = notes
    .slice(0, 10)
    .map((n) => `## ${n.title}\n${n.plainText}`)
    .join("\n\n")
    .slice(0, 8000);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/ai/chat",
    body: {
      apiKey: aiSettings.apiKey,
      model: aiSettings.model,
      noteContext,
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show setup message if no API key
  if (!hasAPIKey()) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <AlertCircleIcon className="h-16 w-16 text-neutral-300 mb-6" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          API Key Required
        </h2>
        <p className="text-neutral-500 mb-6 max-w-sm">
          Add your OpenAI API key in Settings to start chatting with your notes.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = "/settings"}
        >
          Go to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-6 py-4">
        <div className="rounded-full bg-gradient-to-br from-accent-100 to-primary-100 p-2">
          <SparklesIcon className="h-5 w-5 text-accent-600" />
        </div>
        <div>
          <h1 className="font-semibold text-neutral-900">Chat with Notes</h1>
          <p className="text-sm text-neutral-500">
            Ask questions about your {notes.length} notes
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <MessageSquareIcon className="h-16 w-16 text-neutral-200 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                Start a Conversation
              </h2>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                Ask questions about your notes, get summaries, or find connections between ideas.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Summarize my recent notes",
                  "What projects am I working on?",
                  "Find notes about meetings",
                  "What are my main ideas?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      const fakeEvent = {
                        preventDefault: () => {},
                      } as React.FormEvent;
                      handleInputChange({
                        target: { value: suggestion },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "user"
                    ? "bg-primary-100"
                    : "bg-accent-100"
                )}
              >
                {message.role === "user" ? (
                  <span className="text-sm font-medium text-primary-600">U</span>
                ) : (
                  <SparklesIcon className="h-4 w-4 text-accent-600" />
                )}
              </div>
              <div
                className={cn(
                  "flex-1 rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary-500 text-white ml-12"
                    : "bg-neutral-100 text-neutral-700 mr-12"
                )}
              >
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100">
                <SparklesIcon className="h-4 w-4 text-accent-600" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-neutral-500">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error.message}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your notes..."
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isLoading}
            >
              <SendIcon className="h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
