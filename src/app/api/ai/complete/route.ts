import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const runtime = "edge";

const PROMPTS: Record<string, string> = {
  continue: "Continue writing the following text naturally, maintaining the same tone and style. Only output the continuation, not the original text:",
  improve: "Improve the following text while maintaining its meaning. Make it clearer, more engaging, and better structured. Only output the improved version:",
  summarize: "Summarize the following text concisely, capturing the key points in a brief paragraph:",
  expand: "Expand on the following text with more detail, examples, and depth. Add relevant information while keeping the same tone:",
  "fix-grammar": "Fix any grammar, spelling, and punctuation errors in the following text. Only output the corrected version:",
};

export async function POST(req: Request) {
  // Rate limiting check
  const ip = getClientIP(req);
  const limit = rateLimit(ip);

  if (!limit.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please try again later.",
        resetAt: limit.resetAt.toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": limit.resetAt.toISOString(),
        },
      }
    );
  }

  try {
    const { action, prompt, context, apiKey, model = "gpt-4o-mini" } = await req.json();

    // Validate API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Text required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const promptTemplate = PROMPTS[action] || PROMPTS.improve;
    const fullPrompt = context
      ? `Context from the note:\n${context}\n\n${promptTemplate}\n\n${prompt}`
      : `${promptTemplate}\n\n${prompt}`;

    // Use user-provided API key
    const openai = createOpenAI({ apiKey });

    const result = streamText({
      model: openai(model),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI completion error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate completion" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
