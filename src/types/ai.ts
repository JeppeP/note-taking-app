export interface AISettings {
  apiKey: string;
  model: string;
  temperature: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  noteReferences?: string[];
  timestamp: Date;
}

export type AIAction = "continue" | "improve" | "summarize" | "expand" | "fix-grammar";

export interface AIActionConfig {
  action: AIAction;
  label: string;
  description: string;
  icon: string;
  prompt: string;
}

export const AI_ACTIONS: AIActionConfig[] = [
  {
    action: "continue",
    label: "Continue Writing",
    description: "Let AI continue your text",
    icon: "pen-line",
    prompt: "Continue writing the following text naturally, maintaining the same tone and style:",
  },
  {
    action: "improve",
    label: "Improve Writing",
    description: "Enhance clarity and flow",
    icon: "sparkles",
    prompt: "Improve the following text while maintaining its meaning. Make it clearer, more engaging, and better structured:",
  },
  {
    action: "summarize",
    label: "Summarize",
    description: "Create a concise summary",
    icon: "list",
    prompt: "Summarize the following text concisely, capturing the key points:",
  },
  {
    action: "expand",
    label: "Expand",
    description: "Add more detail and depth",
    icon: "maximize-2",
    prompt: "Expand on the following text with more detail, examples, and depth:",
  },
  {
    action: "fix-grammar",
    label: "Fix Grammar",
    description: "Correct grammar and spelling",
    icon: "check",
    prompt: "Fix any grammar, spelling, and punctuation errors in the following text:",
  },
];
