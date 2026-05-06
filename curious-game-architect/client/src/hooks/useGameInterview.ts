import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { INTERVIEW_QUESTIONS, getNextQuestion, isGameSpecComplete } from '@shared/interviewFlow';
import type { GameSpec, ChatMessage } from '@shared/types';

interface UseGameInterviewReturn {
  gameSpec: GameSpec;
  messages: ChatMessage[];
  isLoading: boolean;
  progress: number;
  isComplete: boolean;
  sendMessage: (content: string) => Promise<void>;
  generateGame: () => Promise<{ htmlCode: string; prompt: string }>;
}

export function useGameInterview(): UseGameInterviewReturn {
  const [gameSpec, setGameSpec] = useState<GameSpec>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const generateGameMutation = trpc.game.generateGame.useMutation();

  const progress = Math.round(
    (Object.keys(gameSpec).filter((k) => gameSpec[k as keyof GameSpec]).length /
      INTERVIEW_QUESTIONS.length) *
      100
  );

  const isComplete = isGameSpecComplete(gameSpec);

  const sendMessage = useCallback(
    async (userContent: string) => {
      // Allow empty content for initial greeting
      if (!userContent.trim() && messages.length > 0) return;

      // Add user message (only if not initial greeting)
      if (userContent.trim()) {
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: userContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }
      setIsLoading(true);

      try {
        // Update GameSpec with the user's answer
        const nextQuestion = getNextQuestion(gameSpec);
        let updatedSpec = { ...gameSpec };

        if (nextQuestion) {
          updatedSpec = {
            ...updatedSpec,
            [nextQuestion.field]: userContent,
          };
          setGameSpec(updatedSpec);
        }

        // Build conversation history for AI
        const conversationHistory = messages
          .map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
          .concat([{ role: 'user' as const, content: userContent }]);

        // Call LLM to get AI response
        const systemPrompt = `You are a curious and enthusiastic game designer AI. Your job is to help the user design a game by asking questions one at a time.

Current game specification collected:
${Object.entries(updatedSpec)
  .filter(([, v]) => v)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}

Interview topics to cover (in order):
1. Genre - ${updatedSpec.genre ? '✓' : '○'}
2. Mechanics - ${updatedSpec.mechanics ? '✓' : '○'}
3. Visual Style - ${updatedSpec.visuals ? '✓' : '○'}
4. Target Audience - ${updatedSpec.audience ? '✓' : '○'}
5. Story/Theme - ${updatedSpec.story ? '✓' : '○'}
6. Progression - ${updatedSpec.progression ? '✓' : '○'}
7. Special Features - ${updatedSpec.special_features ? '✓' : '○'}

Guidelines:
- Ask ONE question at a time
- Listen to their answer and ask follow-up clarifying questions if needed (max 2 follow-ups)
- Be encouraging and creative
- Once you have enough detail on a topic, move to the next question
- When all topics are covered, tell them you're ready to generate their game
- Keep responses concise (2-3 sentences max)
- Use emojis occasionally for engagement`;

        // Generate AI response
        let aiContent = '';

        if (messages.length === 0) {
          // Initial greeting
          aiContent =
            "Hello! I'm your game design assistant. Let's create an amazing game together! 🎮\n\n**What genre is your game?** (e.g., puzzle, action, adventure, strategy, casual, racing, etc.)";
        } else if (isComplete) {
          aiContent =
            '🎮 Perfect! I have all the details I need to create your game. Let me generate it now... This may take a moment! ⏳';
        } else {
          const nextQ = getNextQuestion(updatedSpec);
          if (nextQ) {
            aiContent = `Great! That sounds awesome! 🎯\n\n**${nextQ.question}**`;
          } else {
            aiContent = 'I think I have enough information. Let me generate your game!';
          }
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error in interview:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [gameSpec, messages]
  );

  const generateGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await generateGameMutation.mutateAsync({
        gameSpec: gameSpec as Record<string, string | undefined>,
      });

      const successMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content:
          '🎮 **Your game is ready!** Check the preview below. You can play it right here or download it as a standalone HTML file.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);

      return {
        htmlCode: result.htmlCode as string,
        prompt: result.prompt as string,
      };
    } catch (error) {
      console.error('Game generation error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 4).toString(),
        role: 'assistant',
        content: 'Failed to generate the game. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [gameSpec, generateGameMutation]);

  return {
    gameSpec,
    messages,
    isLoading,
    progress,
    isComplete,
    sendMessage,
    generateGame,
  };
}
