"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ExternalLinkIcon,
  DownloadIcon,
  UploadIcon,
  DatabaseIcon,
  Loader2Icon,
  TrashIcon,
} from "lucide-react";
import { Button, Input, useToast } from "@/components/ui";
import { useSettingsStore } from "@/stores/settings-store";
import { useNotesStore } from "@/stores/notes-store";
import { useFoldersStore } from "@/stores/folders-store";
import { downloadExport, importFromJSON } from "@/lib/export-import";
import { db } from "@/lib/db";

export default function SettingsPage() {
  const { aiSettings, setAPIKey, setModel, setTemperature, hasAPIKey } = useSettingsStore();
  const { loadNotes, notes } = useNotesStore();
  const { loadFolders, folders } = useFoldersStore();
  const { addToast } = useToast();

  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(aiSettings.apiKey);
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveKey = () => {
    setAPIKey(localKey);
    setSaved(true);
    addToast("API key saved", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport();
      addToast("Backup downloaded successfully", "success");
    } catch (error) {
      addToast("Failed to export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await importFromJSON(text);
      await loadNotes();
      await loadFolders();
      addToast(`Imported ${result.notes} notes and ${result.folders} folders`, "success");
    } catch (error) {
      addToast("Failed to import data. Check file format.", "error");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete ALL notes and folders? This cannot be undone.")) {
      return;
    }
    if (!confirm("This will permanently delete all your data. Are you absolutely sure?")) {
      return;
    }

    try {
      await db.notes.clear();
      await db.folders.clear();
      await loadNotes();
      await loadFolders();
      addToast("All data cleared", "success");
    } catch (error) {
      addToast("Failed to clear data", "error");
    }
  };

  const models = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Affordable)" },
    { value: "gpt-4o", label: "GPT-4o (Most Capable)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)" },
  ];

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-neutral-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mx-auto max-w-2xl px-6 py-8 space-y-8"
        >
          {/* AI Settings */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <KeyIcon className="h-5 w-5 text-primary-500" />
              AI Configuration
            </h2>

            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              {/* API Key */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  OpenAI API Key
                </label>
                <p className="mb-3 text-sm text-neutral-500">
                  Your API key is stored locally and never sent to our servers.{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline inline-flex items-center gap-1"
                  >
                    Get your API key
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={localKey}
                      onChange={(e) => setLocalKey(e.target.value)}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showKey ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <Button variant="primary" onClick={handleSaveKey}>
                    {saved ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {hasAPIKey() && (
                  <p className="mt-2 text-sm text-success flex items-center gap-1">
                    <CheckIcon className="h-4 w-4" />
                    API key configured
                  </p>
                )}
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  AI Model
                </label>
                <select
                  value={aiSettings.model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Creativity (Temperature): {aiSettings.temperature.toFixed(1)}
                </label>
                <p className="mb-3 text-sm text-neutral-500">
                  Lower values make responses more focused. Higher values make them more creative.
                </p>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Management */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <DatabaseIcon className="h-5 w-5 text-primary-500" />
              Data Management
            </h2>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-neutral-50 p-4">
                  <p className="text-2xl font-bold text-neutral-900">{notes.length}</p>
                  <p className="text-sm text-neutral-500">Notes</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-4">
                  <p className="text-2xl font-bold text-neutral-900">{folders.length}</p>
                  <p className="text-sm text-neutral-500">Folders</p>
                </div>
              </div>

              {/* Export */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-700">Export Data</h3>
                <p className="mb-3 text-sm text-neutral-500">
                  Download all your notes and folders as a JSON backup file.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="h-4 w-4" />
                      Export Backup
                    </>
                  )}
                </Button>
              </div>

              {/* Import */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-700">Import Data</h3>
                <p className="mb-3 text-sm text-neutral-500">
                  Restore from a backup file. This will replace all existing data.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4" />
                      Import Backup
                    </>
                  )}
                </Button>
              </div>

              {/* Clear Data */}
              <div className="pt-4 border-t border-neutral-200">
                <h3 className="mb-2 text-sm font-medium text-red-600">Danger Zone</h3>
                <p className="mb-3 text-sm text-neutral-500">
                  Permanently delete all notes and folders. This action cannot be undone.
                </p>
                <Button variant="danger" onClick={handleClearData}>
                  <TrashIcon className="h-4 w-4" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </motion.section>

          {/* About */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">About</h2>
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <p className="text-sm text-neutral-600">
                <strong>Notes</strong> is a local-first note-taking app with AI capabilities.
                All your data is stored locally in your browser using IndexedDB.
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                Your notes never leave your device unless you use the AI features,
                which send content to OpenAI for processing.
              </p>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
