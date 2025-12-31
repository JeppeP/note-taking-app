import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions about the user's notes.
You have access to the context from their notes provided below.

Guidelines:
- Answer questions based on the note context when relevant
- If the answer isn't in the notes, say so and provide general knowledge
- Be concise but thorough
- Use markdown formatting when helpful
- Reference specific parts of notes when applicable`;

export async function POST(req: Request) {
  try {
    const { messages, noteContext, apiKey, model = "gpt-4o-mini" } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemMessage = noteContext
      ? `${SYSTEM_PROMPT}\n\nNote context:\n${noteContext}`
      : SYSTEM_PROMPT;

    const openai = createOpenAI({ apiKey });

    const result = streamText({
      model: openai(model),
      system: systemMessage,
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
