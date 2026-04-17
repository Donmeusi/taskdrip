import OpenAI from "openai";
import { isDemoMode, processTaskWithDemoAI } from "./demo-mode";

const SYSTEM_PROMPT = `You are TaskDrip AI, a research and task-completion agent. Your job is to complete tasks that users delegate to you.

Guidelines:
- Be thorough but concise in your responses
- Structure your output with clear headings and bullet points when appropriate
- If a task involves research, provide well-organized findings with key insights highlighted
- If a task involves writing, produce polished, ready-to-use content
- If a task involves analysis, present your reasoning and conclusions clearly
- Always deliver actionable, useful results
- If you cannot fully complete a task, explain what you were able to do and what limitations you encountered`;

let _client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "***") {
      throw new Error(
        "OPENAI_API_KEY is not configured. Set it in .env.local"
      );
    }
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export interface ProcessTaskResult {
  success: boolean;
  resultText?: string;
  error?: string;
}

export async function processTaskWithAI(
  title: string,
  description: string
): Promise<ProcessTaskResult> {
  // ── Demo mode fallback ──
  // When no OpenAI API key is configured, use mock responses so the
  // full task lifecycle can be demonstrated without external dependencies.
  if (isDemoMode()) {
    return processTaskWithDemoAI(title, description);
  }

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Task: ${title}\n\nDetails: ${description}\n\nPlease complete this task and provide your results.`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        timeout: 60_000, // 60 second timeout
      }
    );

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      return {
        success: false,
        error: "AI returned an empty response. Please try again.",
      };
    }

    return { success: true, resultText };
  } catch (error: unknown) {
    if (error instanceof Error) {
      // OpenAI API errors
      if (error.message.includes("OPENAI_API_KEY")) {
        return { success: false, error: error.message };
      }
      // Timeout
      if (error.name === "TimeoutError" || error.message.includes("timeout")) {
        return {
          success: false,
          error: "AI processing timed out. Please try again later.",
        };
      }
      // Rate limit
      if (error.message.includes("429") || error.message.includes("rate")) {
        return {
          success: false,
          error: "AI service is busy. Please try again in a moment.",
        };
      }
      // API errors with status
      if ("status" in error) {
        const status = (error as { status: number }).status;
        if (status === 401) {
          return { success: false, error: "Invalid API key configuration." };
        }
        if (status === 503) {
          return {
            success: false,
            error: "AI service is temporarily unavailable. Please try again.",
          };
        }
      }
      return {
        success: false,
        error: `AI processing failed: ${error.message}`,
      };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}