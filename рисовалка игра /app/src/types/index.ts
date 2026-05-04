export type ToolType = 'pen' | 'eraser' | 'fill' | 'line' | 'rect' | 'circle' | 'picker' | 'mirror' | 'spray';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'add' | 'subtract';

export type MirrorMode = 'none' | 'x' | 'y' | 'both';

export type GameMode = 'hub' | 'sandbox' | 'challenge' | 'battle' | 'daily';

export interface Layer {
  id: string;
  name: string;
  pixels: string[];
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
}

export interface Frame {
  id: string;
  layers: Layer[];
}

export interface ToolConfig {
  id: ToolType;
  name: string;
  icon: string;
  cursor: string;
}

export interface ProjectData {
  name: string;
  gridSize: number;
  frames: Frame[];
  currentFrameIndex: number;
  activeLayerId: string;
  palette: string[];
  version: number;
}

export interface HistoryState {
  frames: Frame[];
  currentFrameIndex: number;
  activeLayerId: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  type: 'speed' | 'limit' | 'tool' | 'accuracy' | 'creative' | 'daily';
  timeLimit?: number;
  toolRequired?: string;
  maxColors?: number;
  gridSize?: number;
  minLayers?: number;
  minFrames?: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
}

export interface PlayerStats {
  xp: number;
  level: number;
  totalPixelsDrawn: number;
  totalDrawings: number;
  challengesCompleted: string[];
  achievementsUnlocked: string[];
  streakDays: number;
  lastPlayedDate: string;
  totalPlayTime: number;
  toolsUsed: Record<string, number>;
  colorsUsed: string[];
}

export const PRESET_COLORS = [
  '#ffffff','#d4d4d4','#a0a0a0','#555555','#111111',
  '#ff595e','#ff924c','#ffca3a','#8ac926','#1982c4',
  '#6a4c93','#f72585','#ff006e','#fb5607','#ffbe0b',
  '#3a86ff','#06d6a0','#118ab2','#073b4c','#370617',
  '#ffd6ff','#e7c6ff','#c8b6ff','#b8c0ff','#bbd0ff',
  '#caffbf','#9bf6ff','#ffd6a5','#fdffb6','#ffadad',
  '#8b5cf6','#ec4899','#14b8a6','#f59e0b','#6366f1',
  '#10b981','#ef4444','#3b82f6','#a855f7','#64748b',
];

export const TOOL_CONFIGS: ToolConfig[] = [
  { id: 'pen', name: 'Карандаш', icon: 'Pencil', cursor: 'crosshair' },
  { id: 'eraser', name: 'Ластик', icon: 'Eraser', cursor: 'crosshair' },
  { id: 'fill', name: 'Заливка', icon: 'PaintBucket', cursor: 'pointer' },
  { id: 'line', name: 'Линия', icon: 'Minus', cursor: 'crosshair' },
  { id: 'rect', name: 'Прямоугольник', icon: 'Square', cursor: 'crosshair' },
  { id: 'circle', name: 'Круг', icon: 'Circle', cursor: 'crosshair' },
  { id: 'picker', name: 'Пипетка', icon: 'Pipette', cursor: 'crosshair' },
  { id: 'mirror', name: 'Зеркало', icon: 'FlipHorizontal', cursor: 'crosshair' },
  { id: 'spray', name: 'Спрей', icon: 'SprayCan', cursor: 'crosshair' },
];

export const GRID_SIZES = [8, 16, 24, 32, 48, 64];
