import { Readable } from "stream";

export type LLMProvider = "openai" | "anthropic" | "gemini";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LLMStreamOptions {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Stream LLM response token-by-token
 * Returns a readable stream that emits tokens as they arrive
 */
export async function streamLLMResponse(options: LLMStreamOptions): Promise<Readable> {
  const { provider, apiKey, model, messages, temperature = 0.7, maxTokens = 4096 } = options;

  switch (provider) {
    case "openai":
      return streamOpenAI(apiKey, model, messages, temperature, maxTokens);
    case "anthropic":
      return streamAnthropic(apiKey, model, messages, temperature, maxTokens);
    case "gemini":
      return streamGemini(apiKey, model, messages, temperature, maxTokens);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);;
  }
}

async function streamOpenAI(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<Readable> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return Readable.from(streamOpenAIResponse(response));
}

async function* streamOpenAIResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) yield token;
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<Readable> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  return Readable.from(streamAnthropicResponse(response));
}

async function* streamAnthropicResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              yield parsed.delta.text;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function streamGemini(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
): Promise<Readable> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: messages.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  return Readable.from(streamGeminiResponse(response));
}

async function* streamGeminiResponse(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
