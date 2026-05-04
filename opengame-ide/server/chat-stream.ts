import { Response } from "express";
import { streamLLMResponse, LLMMessage, LLMProvider } from "./llm";
import * as db from "./db";

export interface StreamChatRequest {
  sessionId: number;
  userId: number;
  provider: LLMProvider;
  apiKey: string;
  model: string;
  userMessage: string;
  conversationHistory: LLMMessage[];
}

export async function streamChatResponse(req: StreamChatRequest, res: Response) {
  const { sessionId, provider, apiKey, model, userMessage, conversationHistory } = req;

  await db.addMessage(sessionId, "user", userMessage);

  const messages: LLMMessage[] = [
    {
      role: "system",
      content: "You are an expert game developer AI. Generate complete, working HTML/CSS/JavaScript code for browser games. Always wrap game code in code blocks.",
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await streamLLMResponse({
      provider,
      apiKey,
      model,
      messages,
      temperature: 0.7,
      maxTokens: 4096,
    });

    let fullResponse = "";

    stream.on("data", (chunk: Buffer) => {
      const token = chunk.toString();
      fullResponse += token;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    });

    stream.on("end", async () => {
      await db.addMessage(sessionId, "assistant", fullResponse);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    });

    stream.on("error", (error: Error) => {
      console.error("Stream error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error("Chat stream error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to stream response" })}\n\n`);
    res.end();
  }
}
