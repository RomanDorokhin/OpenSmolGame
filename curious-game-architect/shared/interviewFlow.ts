import { GameSpec, InterviewQuestion } from './types';

/**
 * Interview questions that guide the user through game design
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'genre',
    field: 'genre',
    question: 'What genre is your game? (e.g., puzzle, action, adventure, strategy, casual, racing, etc.)',
  },
  {
    id: 'mechanics',
    field: 'mechanics',
    question: 'Describe the main game mechanics. What does the player do? (e.g., tap to jump, swipe to move, click to shoot, etc.)',
  },
  {
    id: 'visuals',
    field: 'visuals',
    question: 'What visual style do you want? (e.g., pixel art, minimalist, colorful, dark, retro, 3D-like, etc.)',
  },
  {
    id: 'audience',
    field: 'audience',
    question: 'Who is the target audience? (e.g., kids, casual players, hardcore gamers, all ages, etc.)',
  },
  {
    id: 'story',
    field: 'story',
    question: 'Is there a story or theme? (e.g., save the princess, escape the maze, collect coins, survive waves, etc.)',
  },
  {
    id: 'progression',
    field: 'progression',
    question: 'How does difficulty progress? (e.g., increasing speed, more enemies, harder patterns, time limits, etc.)',
  },
  {
    id: 'special_features',
    field: 'special_features',
    question: 'Any special features? (e.g., power-ups, combos, leaderboards, sound effects, particle effects, etc.)',
  },
];

/**
 * Check which GameSpec fields are filled
 */
export function getFilledFields(gameSpec: GameSpec): (keyof GameSpec)[] {
  return Object.keys(gameSpec).filter(
    (key) => gameSpec[key as keyof GameSpec] && gameSpec[key as keyof GameSpec]?.trim()
  ) as (keyof GameSpec)[];
}

/**
 * Get progress percentage
 */
export function getProgressPercentage(gameSpec: GameSpec): number {
  const filled = getFilledFields(gameSpec).length;
  const total = INTERVIEW_QUESTIONS.length;
  return Math.round((filled / total) * 100);
}

/**
 * Check if all required fields are filled
 */
export function isGameSpecComplete(gameSpec: GameSpec): boolean {
  return getFilledFields(gameSpec).length === INTERVIEW_QUESTIONS.length;
}

/**
 * Get the next unanswered question
 */
export function getNextQuestion(gameSpec: GameSpec): InterviewQuestion | null {
  const filledFields = getFilledFields(gameSpec);
  const nextQuestion = INTERVIEW_QUESTIONS.find(
    (q) => !filledFields.includes(q.field)
  );
  return nextQuestion || null;
}

/**
 * Build the final prompt for OpenSmolGame with all technical requirements
 */
export function buildGamePrompt(gameSpec: GameSpec): string {
  const technicalRequirements = `
TECHNICAL REQUIREMENTS (MANDATORY - NO EXCEPTIONS):
- Works without backend — only static HTML/CSS/JS
- Runs in iframe without errors
- Touch controls REQUIRED (no mouse-only)
- Portrait orientation ONLY (vertical screen)
- NO alert(), confirm(), prompt() dialogs
- NO native phone keyboard inside game
- Demo Mode REQUIRED — real gameplay, looped, any game moment
- Loading screen if load time > 2 seconds
- Game Over screen with result and "Play Again" button
- Pause control — user toggles it, auto-pause on app minimize
- First 3 seconds = ACTION — something happens immediately
- Difficulty balance — not too easy, not impossible
- Progression — each level harder
- Playable from start to end without bugs
- Clear Game Over reason — user understands why they lost
- Built-in tutorial if mechanics are non-standard
- Protected from obvious bugs and edge cases
- Tap zones & buttons minimum 44x44px
- Font minimum 16px, readable in sunlight
- Text embedded in game only — no system text
- Sound REQUIRED but only after first user tap
- Demo Mode plays WITHOUT sound (expected behavior)
- Performance on budget Android phones
- High scores saved via localStorage
- Progress saved via localStorage for long games
- User warned that progress is device-bound
- Replayable — randomization, records, different paths
- Own visual style and atmosphere
- Game title visible inside game
- Color contrast — elements visible in sunlight
- Hosted on GitHub Pages — any file structure
- Russian or visual-only language, no language mixing
- NO content 18+, violence, politics (this is Telegram — children present)
- Repository size reasonable for mobile internet
- Cache-busting for updates — users get new version
- Static preview image for search/catalog (Demo doesn't play there)
- Multi-touch handling — works with multiple fingers
- No epilepsy triggers — no flashing > 3 times/second

GAME SPECIFICATION:
Genre: ${gameSpec.genre || 'Not specified'}
Mechanics: ${gameSpec.mechanics || 'Not specified'}
Visual Style: ${gameSpec.visuals || 'Not specified'}
Target Audience: ${gameSpec.audience || 'Not specified'}
Story/Theme: ${gameSpec.story || 'Not specified'}
Progression: ${gameSpec.progression || 'Not specified'}
Special Features: ${gameSpec.special_features || 'Not specified'}

TASK:
Generate a complete, production-ready HTML5 game that:
1. Meets ALL technical requirements above
2. Implements the game design specified above
3. Is a single HTML file with embedded CSS and JavaScript
4. Can be saved as .html and run directly in a browser
5. Works perfectly in an iframe sandbox
6. Has a Demo Mode that loops automatically
7. Includes proper Game Over screen with score/result
8. Has pause functionality
9. Uses localStorage for high scores
10. Has touch controls optimized for mobile
11. Loads within 2 seconds
12. Has clear visual style and is fun to play

Return ONLY the complete HTML code. No explanations, no markdown, no code blocks — just raw HTML.
`;

  return technicalRequirements;
}
