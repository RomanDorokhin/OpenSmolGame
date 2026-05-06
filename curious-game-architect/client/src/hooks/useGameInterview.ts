import { useState, useCallback, useRef } from 'react';
import {
  INTERVIEW_QUESTIONS,
  getNextQuestion,
  isGameSpecComplete,
  getProgressPercentage,
  buildGamePrompt,
} from '@shared/interviewFlow';
import type { GameSpec, ChatMessage } from '@shared/types';
import { callLLM, getLLMSettings } from '@/lib/llm-client';

interface UseGameInterviewReturn {
  gameSpec: GameSpec;
  messages: ChatMessage[];
  /** True while the AI is generating a chat reply */
  isLoading: boolean;
  /** True while the game HTML is being generated */
  isGenerating: boolean;
  progress: number;
  isComplete: boolean;
  sendMessage: (content: string) => Promise<void>;
  generateGame: () => Promise<{ htmlCode: string; prompt: string }>;
  resetInterview: () => void;
}

const SYSTEM_PROMPT = `You are a curious and enthusiastic game designer AI named "Game Architect". Your job is to help the user design their dream game by asking questions one at a time in a friendly, engaging conversation.

Guidelines:
- Ask ONE question at a time
- Be encouraging, creative, and enthusiastic
- Acknowledge the user's answer briefly (1 sentence) before asking the next question
- Keep responses concise (2-4 sentences max)
- Use emojis occasionally for engagement 🎮
- When all 7 topics are covered, tell the user you're ready to generate their game
- Do NOT ask for information already collected

Topics to cover in order:
1. Genre (e.g., puzzle, action, adventure, strategy, casual, racing)
2. Core mechanics (what the player does: tap, swipe, click, etc.)
3. Visual style (pixel art, minimalist, colorful, dark, retro, 3D-like)
4. Target audience (kids, casual players, hardcore gamers, all ages)
5. Story/Theme (save the princess, escape the maze, collect coins, survive waves)
6. Difficulty progression (increasing speed, more enemies, harder patterns, time limits)
7. Special features (power-ups, combos, leaderboards, sound effects, particle effects)`;

function buildSystemMessage(gameSpec: GameSpec): string {
  const collected = Object.entries(gameSpec)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const status = INTERVIEW_QUESTIONS.map((q) => {
    const filled = !!gameSpec[q.field];
    return `${filled ? '✓' : '○'} ${q.field}${filled ? `: ${gameSpec[q.field]}` : ''}`;
  }).join('\n');

  return `${SYSTEM_PROMPT}

Current game spec collected:
${collected || '(nothing yet)'}

Status:
${status}`;
}

function makeMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    timestamp: new Date(),
  };
}

export function useGameInterview(): UseGameInterviewReturn {
  const [gameSpec, setGameSpec] = useState<GameSpec>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Keep a ref to the latest gameSpec for use inside callbacks without stale closure
  const gameSpecRef = useRef<GameSpec>({});
  gameSpecRef.current = gameSpec;

  // Replaced trpc mutations with direct LLM calls

  const progress = getProgressPercentage(gameSpec);
  const isComplete = isGameSpecComplete(gameSpec);

  const resetInterview = useCallback(() => {
    setGameSpec({});
    setMessages([]);
    setIsLoading(false);
    setIsGenerating(false);
  }, []);

  const sendMessage = useCallback(
    async (userContent: string) => {
      // Allow empty string only for the initial greeting trigger
      if (!userContent.trim() && messages.length > 0) return;

      const isInitialGreeting = !userContent.trim() && messages.length === 0;

      // Add user message to the chat (skip for initial greeting)
      let updatedMessages = [...messages];
      if (!isInitialGreeting) {
        const userMsg = makeMessage('user', userContent);
        updatedMessages = [...updatedMessages, userMsg];
        setMessages(updatedMessages);
      }

      setIsLoading(true);

      try {
        // Update GameSpec with the user's answer to the current question
        let updatedSpec = { ...gameSpecRef.current };
        if (!isInitialGreeting) {
          const nextQuestion = getNextQuestion(updatedSpec);
          if (nextQuestion) {
            updatedSpec = { ...updatedSpec, [nextQuestion.field]: userContent };
            setGameSpec(updatedSpec);
          }
        }

        // Build the messages array for the LLM
        const llmMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: buildSystemMessage(updatedSpec) },
          // Include conversation history
          ...updatedMessages
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
        ];

        // Call the LLM for a natural response
        const settings = getLLMSettings();
        const aiContent = await callLLM(llmMessages, settings);

        const aiMsg = makeMessage('assistant', aiContent);
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error) {
        console.error('Error in interview chat:', error);

        // Graceful fallback: use hardcoded question if LLM fails
        const updatedSpec = gameSpecRef.current;
        let fallbackContent: string;

        if (messages.length === 0) {
          fallbackContent =
            "Hello! I'm your Game Architect 🎮 Let's design an amazing game together!\n\n**What genre is your game?** (e.g., puzzle, action, adventure, strategy, casual, racing)";
        } else if (isGameSpecComplete(updatedSpec)) {
          fallbackContent =
            '🎮 Perfect! I have all the details I need. Let me generate your game now... This may take a moment! ⏳';
        } else {
          const nextQ = getNextQuestion(updatedSpec);
          fallbackContent = nextQ
            ? `Got it! 👍\n\n**${nextQ.question}**`
            : "I think I have enough information. Let me generate your game!";
        }

        const fallbackMsg = makeMessage('assistant', fallbackContent);
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const generateGame = useCallback(async () => {
    setIsGenerating(true);
    try {
      const settings = getLLMSettings();
      const prompt = buildGamePrompt(gameSpecRef.current as GameSpec);
      
      const rawHtml = await callLLM([
        {
          role: "system",
          content: "You are an expert game developer. Generate complete, production-ready HTML5 games that work in iframes and on mobile devices. Return ONLY the raw HTML code — no markdown, no code blocks, no explanations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ], settings);

      let htmlCode = typeof rawHtml === 'string' ? rawHtml : '';

      // Strip markdown code blocks if the model wrapped the output
      htmlCode = htmlCode
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      // Post-process logic (same as original server logic)
      if (
        htmlCode.includes('function initGame') &&
        htmlCode.includes('DOMContentLoaded') &&
        !htmlCode.match(/DOMContentLoaded[\s\S]{0,200}initGame\s*\(/)  
      ) {
        htmlCode = htmlCode.replace(
          /(document\.addEventListener\s*\(\s*['"]DOMContentLoaded['"]\s*,\s*(?:function\s*\(\)|\(\)\s*=>)\s*\{)/,
          '$1\n            initGame();'
        );
      }
      
      if (
        htmlCode.includes('function initGame') &&
        !htmlCode.includes('DOMContentLoaded') &&
        !htmlCode.match(/initGame\s*\(\s*\)\s*;/)
      ) {
        htmlCode = htmlCode.replace(
          /(<\/script>)/,
          '\n        document.addEventListener(\'DOMContentLoaded\', initGame);\n        $1'
        );
      }

      const successMsg = makeMessage(
        'assistant',
        '🎮 **Your game is ready!** Check the preview on the right. You can play it directly or download it as a standalone HTML file. Click **"Start Over"** to design a new game!'
      );
      setMessages((prev) => [...prev, successMsg]);

      return {
        htmlCode,
        prompt,
      };
    } catch (error) {
      console.error('Game generation error:', error);
      const errorMsg = makeMessage(
        'assistant',
        '❌ Failed to generate the game. Please try again by clicking the **"Generate Game"** button, or start over with a new design.'
      );
      setMessages((prev) => [...prev, errorMsg]);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    gameSpec,
    messages,
    isLoading,
    isGenerating,
    progress,
    isComplete,
    sendMessage,
    generateGame,
    resetInterview,
  };
}
