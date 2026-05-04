import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Play, Copy, Zap } from "lucide-react";
import { Streamdown } from "streamdown";

const EXAMPLE_PROMPTS = [
  "Создай простую игру Flappy Bird",
  "Создай игру Snake (змейка)",
  "Создай игру Pong (теннис)",
  "Создай Tic Tac Toe (крестики-нолики)",
  "Создай простой платформер",
];

const DEFAULT_API_KEY = "sk-or-v1-1234567890"; // OpenRouter demo key

export default function SimpleIDE() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">OpenGame IDE</h1>
          <p className="text-lg text-muted-foreground mb-8">Создавайте игры с AI</p>
          <a href="/api/oauth/login" className="btn-primary inline-block">
            Начать
          </a>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);

    try {
      // Простой вызов LLM через встроенный ключ
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a game developer. Create complete, working HTML/CSS/JavaScript game code. Always wrap code in ```html or ```javascript blocks.",
            },
            ...messages,
            { role: "user", content: userMessage },
          ],
          apiKey: DEFAULT_API_KEY,
          provider: "openrouter",
          model: "meta-llama/llama-2-70b-chat",
        }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
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

      // Extract game code
      const codeMatch = fullResponse.match(/```(?:html|javascript)?\n([\s\S]*?)\n```/);
      if (codeMatch) {
        setGameCode(codeMatch[1]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ошибка при генерации игры. Попробуйте ещё раз." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRunGame = () => {
    if (iframeRef.current && gameCode) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        try {
          doc.open();
          doc.write(gameCode);
          doc.close();
        } catch (e) {
          console.error("Error writing to iframe:", e);
        }
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">OpenGame IDE</h1>
        <div className="flex gap-2">
          {gameCode && (
            <>
              <Button onClick={handleCopyCode} className="btn-ghost text-xs">
                <Copy className="w-4 h-4 mr-1" />
                Копировать код
              </Button>
              <Button onClick={handleRunGame} className="btn-primary text-xs">
                <Play className="w-4 h-4 mr-1" />
                Запустить игру
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="w-12 h-12 text-primary mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">Выберите пример или напишите свой промпт</p>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {EXAMPLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-left px-3 py-2 rounded bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
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
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 bg-background">
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
                placeholder="Опишите игру которую хотите создать..."
                disabled={isStreaming}
                className="input-base flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isStreaming || !input.trim()}
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col border border-border rounded-lg bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 font-semibold text-sm">
            Предпросмотр игры
          </div>
          <iframe
            ref={iframeRef}
            className="flex-1 border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            title="Game Preview"
          />
        </div>
      </div>
    </div>
  );
}
