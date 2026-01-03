"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, useCompletion } from "ai/react";
import {
  XIcon,
  SparklesIcon,
  MessageSquareIcon,
  MicIcon,
  SendIcon,
  CopyIcon,
  CheckIcon,
  StopCircleIcon,
  PenLineIcon,
  WandIcon,
  ListIcon,
  Maximize2Icon,
  CheckCircleIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useUIStore } from "@/stores/ui-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotesStore } from "@/stores/notes-store";
import { useVoice } from "@/hooks";
import { cn } from "@/lib/utils/cn";
import { AI_ACTIONS } from "@/types";

type Tab = "write" | "chat" | "voice";

export function AIPanel() {
  const { aiPanelOpen, aiPanelTab, setAIPanelTab, toggleAIPanel } = useUIStore();
  const { aiSettings, hasAPIKey } = useSettingsStore();
  const { getCurrentNote, notes } = useNotesStore();

  if (!aiPanelOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 z-40 flex h-full w-[400px] flex-col border-l border-neutral-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-accent-500" />
            <h2 className="font-semibold text-neutral-900">AI Assistant</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleAIPanel}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <TabButton
            active={aiPanelTab === "write"}
            onClick={() => setAIPanelTab("write")}
            icon={<PenLineIcon className="h-4 w-4" />}
            label="Write"
          />
          <TabButton
            active={aiPanelTab === "chat"}
            onClick={() => setAIPanelTab("chat")}
            icon={<MessageSquareIcon className="h-4 w-4" />}
            label="Chat"
          />
          <TabButton
            active={aiPanelTab === "voice"}
            onClick={() => setAIPanelTab("voice")}
            icon={<MicIcon className="h-4 w-4" />}
            label="Voice"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!hasAPIKey() && aiPanelTab !== "voice" ? (
            <NoAPIKey />
          ) : (
            <>
              {aiPanelTab === "write" && <WriteTab />}
              {aiPanelTab === "chat" && <ChatTab />}
              {aiPanelTab === "voice" && <VoiceTab />}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
        active
          ? "border-b-2 border-primary-500 text-primary-600"
          : "text-neutral-500 hover:text-neutral-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}


function WriteTab() {
  const { aiSettings } = useSettingsStore();
  const { getCurrentNote } = useNotesStore();
  const [selectedAction, setSelectedAction] = useState<string>("improve");
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);

  const { completion, complete, isLoading, stop, error } = useCompletion({
    api: "/api/ai/complete",
    body: {
      apiKey: aiSettings.apiKey,
      model: aiSettings.model,
      action: selectedAction,
      context: getCurrentNote()?.plainText?.slice(0, 2000),
    },
  });

  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;
    await complete(inputText);
  };

  const handleCopy = () => {
    if (completion) {
      navigator.clipboard.writeText(completion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Selection */}
      <div className="p-4 border-b border-neutral-100">
        <label className="text-sm font-medium text-neutral-700 mb-2 block">
          Action
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AI_ACTIONS.map((action) => (
            <button
              key={action.action}
              onClick={() => setSelectedAction(action.action)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                selectedAction === action.action
                  ? "bg-primary-100 text-primary-700 ring-1 ring-primary-500"
                  : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <ActionIcon action={action.action} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-b border-neutral-100">
        <label className="text-sm font-medium text-neutral-700 mb-2 block">
          Your text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter or paste text here..."
          className="w-full h-32 rounded-lg border border-neutral-200 p-3 text-sm resize-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <Button
          variant="primary"
          className="w-full mt-3"
          onClick={handleSubmit}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              Generate
            </>
          )}
        </Button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 mb-4">
            {error.message}
          </div>
        )}
        {completion && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Result</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-success" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700 whitespace-pre-wrap">
              {completion}
            </div>
          </div>
        )}
        {isLoading && (
          <Button variant="secondary" className="w-full" onClick={stop}>
            <StopCircleIcon className="h-4 w-4" />
            Stop Generating
          </Button>
        )}
      </div>
    </div>
  );
}

function ChatTab() {
  const { aiSettings } = useSettingsStore();
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquareIcon className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
            <p className="text-sm text-neutral-500">
              Ask questions about your notes or get help with writing.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "rounded-lg p-3 text-sm",
              message.role === "user"
                ? "bg-primary-100 text-primary-900 ml-8"
                : "bg-neutral-100 text-neutral-700 mr-8"
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-neutral-200 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about your notes..."
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={!input.trim() || isLoading}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function VoiceTab() {
  const {
    isRecording,
    transcript,
    interimTranscript,
    fullTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoice();

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (fullTranscript) {
      navigator.clipboard.writeText(fullTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircleIcon className="h-12 w-12 text-neutral-300 mb-4" />
        <h3 className="font-semibold text-neutral-900 mb-2">Not Supported</h3>
        <p className="text-sm text-neutral-500">
          Voice transcription is not supported in this browser. Try Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Recording Control */}
      <div className="flex flex-col items-center justify-center p-8 border-b border-neutral-100">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "relative h-24 w-24 rounded-full transition-all duration-300",
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-primary-500 hover:bg-primary-600"
          )}
        >
          {isRecording && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-50" />
          )}
          <MicIcon className="h-10 w-10 text-white relative z-10 mx-auto" />
        </button>
        <p className="mt-4 text-sm text-neutral-500">
          {isRecording ? "Listening... Click to stop" : "Click to start recording"}
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-4">
        {fullTranscript ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Transcript</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearTranscript}>
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-success" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-700">
              {transcript}
              {interimTranscript && (
                <span className="text-neutral-400">{interimTranscript}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-neutral-400">
            Your transcription will appear here
          </div>
        )}
      </div>
    </div>
  );
}

function ActionIcon({ action }: { action: string }) {
  switch (action) {
    case "continue":
      return <PenLineIcon className="h-4 w-4" />;
    case "improve":
      return <WandIcon className="h-4 w-4" />;
    case "summarize":
      return <ListIcon className="h-4 w-4" />;
    case "expand":
      return <Maximize2Icon className="h-4 w-4" />;
    case "fix-grammar":
      return <CheckCircleIcon className="h-4 w-4" />;
    default:
      return <SparklesIcon className="h-4 w-4" />;
  }
}

function NoAPIKey() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <AlertCircleIcon className="h-12 w-12 text-neutral-300 mb-4" />
      <h3 className="font-semibold text-neutral-900 mb-2">API Key Required</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Add your OpenAI API key in Settings to use AI features.
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
