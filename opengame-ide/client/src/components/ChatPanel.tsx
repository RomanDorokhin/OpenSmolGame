import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface ChatPanelProps {
  sessionId?: number;
  onGameCodeExtracted: (code: string) => void;
}

export default function ChatPanel({ sessionId, onGameCodeExtracted }: ChatPanelProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = trpc.chat.messages.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data as any);
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      await sendMessageMutation.mutateAsync({
        sessionId,
        content: userMessage,
      });

      // Stream the response from OpenGame API
      const opengameUrl = process.env.REACT_APP_OPENGAME_URL || "http://localhost:5000";
      const response = await fetch(`${opengameUrl}/api/generate-game-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          apiKey: localStorage.getItem("opengame_api_key") || "",
          provider: localStorage.getItem("opengame_provider") || "openai",
          model: localStorage.getItem("opengame_model") || "gpt-4",
        }),
      });

      let activeResponse = response;
      if (!response.ok) {
        // Fallback to local endpoint
        activeResponse = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userMessage,
            conversationHistory: messages,
          }),
        });
        if (!activeResponse.ok) throw new Error("Stream failed");
      }
      const reader = activeResponse.body?.getReader();
      if (!reader) throw new Error("No reader");

      let fullResponse = "";
      const decoder = new TextDecoder();

      let assistantMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                fullResponse += data.token;
                assistantMessage.content = fullResponse;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = assistantMessage;
                  return updated;
                });
              }
              if (data.done) break;
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Extract game code from response
      const codeMatch = fullResponse.match(/```(?:html|javascript)?\n([\s\S]*?)\n```/);
      if (codeMatch) {
        onGameCodeExtracted(codeMatch[1]);
      } else if (fullResponse.includes("<!DOCTYPE html")) {
        const htmlMatch = fullResponse.match(/<!DOCTYPE html[\s\S]*<\/html>/);
        if (htmlMatch) {
          onGameCodeExtracted(htmlMatch[0]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="ide-chat flex flex-col h-full">
      <div className="ide-chat-messages">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <p className="text-lg font-semibold text-foreground mb-4">🎮 Создайте свою игру</p>
              <p className="text-sm text-muted-foreground mb-6">
                Опишите игру, которую хотите создать. Примеры:
              </p>
              <div className="space-y-2 text-left">
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  💡 "Создай простую игру Flappy Bird"
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  💡 "Создай игру Snake с клавиатурой"
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  💡 "Создай простой платформер с прыжками"
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={msg.role === "user" ? "message-user" : "message-assistant"}
            >
              <div className="message-content">
                {msg.role === "assistant" ? (
                  <Streamdown>{msg.content}</Streamdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        {isStreaming && (
          <div className="message-assistant">
            <div className="message-content">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ide-chat-input">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Опишите игру..."
            disabled={isStreaming || !sessionId}
            className="input-base flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isStreaming || !sessionId || !input.trim()}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
