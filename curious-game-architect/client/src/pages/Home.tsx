import { useState, useRef, useEffect } from 'react';
import { useGameInterview } from '@/hooks/useGameInterview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Download } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { INTERVIEW_QUESTIONS } from '@shared/interviewFlow';

export default function Home() {
  const { gameSpec, messages, isLoading, progress, isComplete, sendMessage, generateGame } =
    useGameInterview();
  const [userInput, setUserInput] = useState('');
  const [generatedGame, setGeneratedGame] = useState<{
    htmlCode: string;
    prompt: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage('');
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    await sendMessage(userInput);
    setUserInput('');

    // If interview is complete, generate the game
    if (isComplete) {
      setTimeout(async () => {
        try {
          const result = await generateGame();
          setGeneratedGame(result);
        } catch (error) {
          console.error('Failed to generate game:', error);
        }
      }, 500);
    }
  };

  const downloadGame = () => {
    if (!generatedGame) return;

    const element = document.createElement('a');
    const file = new Blob([generatedGame.htmlCode], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'game.html';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const collectedFields = Object.keys(gameSpec).filter((k) => gameSpec[k as keyof typeof gameSpec]);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Game Architect</h1>
              <p className="text-xs text-muted-foreground">
                Progress: {progress}% ({collectedFields.length}/{INTERVIEW_QUESTIONS.length})
              </p>
            </div>
            {generatedGame && (
              <Button
                onClick={downloadGame}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Download size={16} />
                Download Game
              </Button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-2xl mx-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card
                    className={`max-w-md px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <Streamdown>{msg.content as string}</Streamdown>
                  </Card>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
              placeholder="Type your answer..."
              disabled={isLoading || generatedGame !== null}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim() || generatedGame !== null}
              size="icon"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Game Preview Area */}
      {generatedGame && (
        <div className="w-1/2 border-l border-border bg-background flex flex-col">
          <div className="border-b border-border bg-card px-4 py-3">
            <h2 className="text-lg font-semibold">Game Preview</h2>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <iframe
              srcDoc={generatedGame.htmlCode as string}
              className="w-full h-full border border-border rounded-lg"
              title="Game Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
