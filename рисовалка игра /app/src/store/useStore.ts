import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolType, Layer, Frame, BlendMode, MirrorMode, HistoryState } from '@/types';
import { GRID_SIZES } from '@/types';

// === GAME TYPES ===
export type GameMode = 'hub' | 'sandbox' | 'challenge' | 'battle' | 'daily';

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  type: 'speed' | 'limit' | 'tool' | 'accuracy' | 'creative' | 'daily';
  timeLimit?: number; // seconds
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
  totalPlayTime: number; // minutes
  toolsUsed: Record<string, number>;
  colorsUsed: string[];
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'speed_30',
    title: 'Speed Demon',
    description: 'Нарисуй что угодно за 30 секунд!',
    type: 'speed',
    timeLimit: 30,
    xpReward: 50,
    difficulty: 'easy',
    icon: 'Zap',
  },
  {
    id: 'speed_60',
    title: 'Flash Artist',
    description: 'Нарисуй рисунок за 60 секунд!',
    type: 'speed',
    timeLimit: 60,
    xpReward: 75,
    difficulty: 'medium',
    icon: 'Zap',
  },
  {
    id: 'minimalist_3',
    title: 'Minimalist',
    description: 'Используй только 3 цвета',
    type: 'limit',
    maxColors: 3,
    xpReward: 100,
    difficulty: 'medium',
    icon: 'Palette',
  },
  {
    id: 'mirror_master',
    title: 'Mirror Master',
    description: 'Нарисуй что-то с включенным зеркалом',
    type: 'tool',
    toolRequired: 'mirror',
    xpReward: 75,
    difficulty: 'easy',
    icon: 'FlipHorizontal',
  },
  {
    id: 'fill_frenzy',
    title: 'Fill Frenzy',
    description: 'Используй заливку минимум 5 раз',
    type: 'tool',
    toolRequired: 'fill',
    xpReward: 60,
    difficulty: 'easy',
    icon: 'PaintBucket',
  },
  {
    id: 'tiny_artist',
    title: 'Tiny Artist',
    description: 'Создай шедевр на холсте 8×8',
    type: 'limit',
    gridSize: 8,
    xpReward: 100,
    difficulty: 'medium',
    icon: 'Minimize2',
  },
  {
    id: 'layer_cake',
    title: 'Layer Cake',
    description: 'Используй минимум 3 слоя',
    type: 'creative',
    minLayers: 3,
    xpReward: 125,
    difficulty: 'medium',
    icon: 'Layers',
  },
  {
    id: 'animator',
    title: 'Animation Ace',
    description: 'Создай анимацию из 4+ кадров',
    type: 'creative',
    minFrames: 4,
    xpReward: 150,
    difficulty: 'hard',
    icon: 'Film',
  },
  {
    id: 'line_art',
    title: 'Line Art',
    description: 'Нарисуй только линиями',
    type: 'tool',
    toolRequired: 'line',
    xpReward: 80,
    difficulty: 'easy',
    icon: 'Minus',
  },
  {
    id: 'spray_paint',
    title: 'Street Artist',
    description: 'Используй спрей минимум 10 раз',
    type: 'tool',
    toolRequired: 'spray',
    xpReward: 70,
    difficulty: 'easy',
    icon: 'SprayCan',
  },
  {
    id: 'perfect_circle',
    title: 'Geometry Master',
    description: 'Нарисуй 3 идеальных круга',
    type: 'tool',
    toolRequired: 'circle',
    xpReward: 90,
    difficulty: 'medium',
    icon: 'Circle',
  },
  {
    id: 'big_canvas',
    title: 'Grand Canvas',
    description: 'Создай работу на холсте 48×48',
    type: 'limit',
    gridSize: 48,
    xpReward: 200,
    difficulty: 'hard',
    icon: 'Maximize2',
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_pixel',
    title: 'Первый пиксель',
    description: 'Нарисуй свой первый пиксель',
    icon: 'Pencil',
    condition: 'draw_1',
    xpReward: 10,
  },
  {
    id: 'pixel_100',
    title: 'Pixel Novice',
    description: 'Нарисуй 100 пикселей',
    icon: 'Pencil',
    condition: 'draw_100',
    xpReward: 25,
  },
  {
    id: 'pixel_1000',
    title: 'Pixel Master',
    description: 'Нарисуй 1000 пикселей',
    icon: 'Pencil',
    condition: 'draw_1000',
    xpReward: 100,
  },
  {
    id: 'pixel_10000',
    title: 'Pixel God',
    description: 'Нарисуй 10000 пикселей',
    icon: 'Pencil',
    condition: 'draw_10000',
    xpReward: 500,
  },
  {
    id: 'tool_collector',
    title: 'Tool Collector',
    description: 'Используй каждый инструмент хотя бы раз',
    icon: 'Wrench',
    condition: 'all_tools',
    xpReward: 75,
  },
  {
    id: 'challenge_1',
    title: 'First Challenge',
    description: 'Выполни первый челлендж',
    icon: 'Trophy',
    condition: 'challenge_1',
    xpReward: 50,
  },
  {
    id: 'challenge_5',
    title: 'Challenge Hunter',
    description: 'Выполни 5 челленджей',
    icon: 'Trophy',
    condition: 'challenge_5',
    xpReward: 150,
  },
  {
    id: 'challenge_all',
    title: 'Challenge Legend',
    description: 'Выполни все челленджи',
    icon: 'Trophy',
    condition: 'challenge_all',
    xpReward: 500,
  },
  {
    id: 'level_5',
    title: 'Rising Star',
    description: 'Достигни 5 уровня',
    icon: 'Star',
    condition: 'level_5',
    xpReward: 100,
  },
  {
    id: 'level_10',
    title: 'Pixel Veteran',
    description: 'Достигни 10 уровня',
    icon: 'Star',
    condition: 'level_10',
    xpReward: 250,
  },
  {
    id: 'level_20',
    title: 'Pixel Legend',
    description: 'Достигни 20 уровня',
    icon: 'Star',
    condition: 'level_20',
    xpReward: 1000,
  },
  {
    id: 'animator',
    title: 'Animator',
    description: 'Создай анимацию из 3+ кадров',
    icon: 'Film',
    condition: 'anim_frames',
    xpReward: 100,
  },
  {
    id: 'layer_user',
    title: 'Layer Artist',
    description: 'Используй 3+ слоя в одном проекте',
    icon: 'Layers',
    condition: 'layers_3',
    xpReward: 75,
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Играй 3 дня подряд',
    icon: 'Flame',
    condition: 'streak_3',
    xpReward: 100,
  },
  {
    id: 'streak_7',
    title: 'Unstoppable',
    description: 'Играй 7 дней подряд',
    icon: 'Flame',
    condition: 'streak_7',
    xpReward: 300,
  },
  {
    id: 'export_first',
    title: 'Exporter',
    description: 'Сохрани свой первый рисунок',
    icon: 'Download',
    condition: 'export_1',
    xpReward: 25,
  },
];

function xpForLevel(level: number) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getLevelFromXp(xp: number) {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return level;
}

function createEmptyLayer(id: string, name: string, gridSize: number): Layer {
  return {
    id,
    name,
    pixels: new Array(gridSize * gridSize).fill(''),
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    locked: false,
  };
}

function createEmptyFrame(frameId: string, gridSize: number): Frame {
  return {
    id: frameId,
    layers: [createEmptyLayer(`layer-${Date.now()}`, 'Слой 1', gridSize)],
  };
}

function cloneFrame(frame: Frame): Frame {
  return {
    id: frame.id,
    layers: frame.layers.map(l => ({
      ...l,
      pixels: [...l.pixels],
    })),
  };
}

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map(cloneFrame);
}

// === STORE ===
interface AppState {
  // === DRAWING ===
  projectName: string;
  gridSize: number;
  frames: Frame[];
  currentFrameIndex: number;
  activeLayerId: string;
  currentTool: ToolType;
  currentColor: string;
  recentColors: string[];
  mirrorMode: MirrorMode;
  sprayDensity: number;
  rectFill: boolean;
  circleFill: boolean;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showOnionSkin: boolean;
  isPlaying: boolean;
  fps: number;
  playbackFrame: number;
  undoStack: HistoryState[];
  redoStack: HistoryState[];
  exportScale: number;

  // === GAME ===
  gameMode: GameMode;
  activeChallenge: ChallengeDef | null;
  challengeTimer: number;
  challengeActive: boolean;
  playerStats: PlayerStats;
  showAchievements: boolean;
  battleTheme: string;
  battlePhase: 'draw' | 'vote' | 'result';
  battlePlayer1Drawing: string | null;
  battlePlayer2Drawing: string | null;
  battleCurrentPlayer: 1 | 2;
  battleTimeLeft: number;

  // === COMPUTED ===
  currentFrame: () => Frame;
  currentLayer: () => Layer | undefined;

  // === DRAWING ACTIONS ===
  setProjectName: (name: string) => void;
  setGridSize: (size: number) => void;
  setTool: (tool: ToolType) => void;
  setColor: (color: string) => void;
  setMirrorMode: (mode: MirrorMode) => void;
  setSprayDensity: (d: number) => void;
  setRectFill: (fill: boolean) => void;
  setCircleFill: (fill: boolean) => void;
  setZoom: (z: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  toggleGrid: () => void;
  toggleOnionSkin: () => void;
  setFps: (fps: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackFrame: (frame: number) => void;
  setExportScale: (scale: number) => void;

  setPixel: (x: number, y: number, color: string) => void;
  setPixels: (coords: [number, number][], color: string) => void;
  floodFill: (x: number, y: number, color: string) => void;

  addLayer: () => void;
  deleteLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerBlendMode: (id: string, mode: BlendMode) => void;
  renameLayer: (id: string, name: string) => void;
  moveLayer: (id: string, direction: 'up' | 'down') => void;

  addFrame: () => void;
  duplicateFrame: (index: number) => void;
  deleteFrame: (index: number) => void;
  setCurrentFrame: (index: number) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  clearProject: () => void;
  loadProject: (data: any) => void;

  // === GAME ACTIONS ===
  setGameMode: (mode: GameMode) => void;
  startChallenge: (challenge: ChallengeDef) => void;
  completeChallenge: () => void;
  failChallenge: () => void;
  tickChallengeTimer: () => void;
  addXp: (amount: number) => void;
  trackPixelDrawn: () => void;
  trackToolUsed: (tool: string) => void;
  trackColorUsed: (color: string) => void;
  trackExport: () => void;
  checkAchievements: () => void;
  toggleAchievements: () => void;
  updateStreak: () => void;

  // Battle
  startBattle: (theme: string) => void;
  setBattlePhase: (phase: 'draw' | 'vote' | 'result') => void;
  switchBattlePlayer: () => void;
  tickBattleTimer: () => void;
  setBattleTheme: (theme: string) => void;
  captureBattleDrawing: (player: 1 | 2, dataUrl: string) => void;
}

function getDefaultStats(): PlayerStats {
  const today = new Date().toISOString().split('T')[0];
  return {
    xp: 0,
    level: 1,
    totalPixelsDrawn: 0,
    totalDrawings: 0,
    challengesCompleted: [],
    achievementsUnlocked: [],
    streakDays: 1,
    lastPlayedDate: today,
    totalPlayTime: 0,
    toolsUsed: {},
    colorsUsed: [],
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // === DRAWING STATE ===
      projectName: 'Untitled',
      gridSize: 16,
      frames: [createEmptyFrame('frame-0', 16)],
      currentFrameIndex: 0,
      activeLayerId: '',
      currentTool: 'pen',
      currentColor: '#ff6b35',
      recentColors: ['#ff6b35', '#ffd23f', '#06d6a0', '#a855f7', '#3a86ff'],
      mirrorMode: 'none',
      sprayDensity: 0.3,
      rectFill: true,
      circleFill: true,
      zoom: 1,
      panX: 0,
      panY: 0,
      showGrid: true,
      showOnionSkin: false,
      isPlaying: false,
      fps: 8,
      playbackFrame: 0,
      undoStack: [],
      redoStack: [],
      exportScale: 8,

      // === GAME STATE ===
      gameMode: 'hub',
      activeChallenge: null,
      challengeTimer: 0,
      challengeActive: false,
      playerStats: getDefaultStats(),
      showAchievements: false,
      battleTheme: '',
      battlePhase: 'draw',
      battlePlayer1Drawing: null,
      battlePlayer2Drawing: null,
      battleCurrentPlayer: 1,
      battleTimeLeft: 60,

      currentFrame: () => {
        const s = get();
        return s.frames[s.currentFrameIndex] || s.frames[0];
      },
      currentLayer: () => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        if (!frame) return undefined;
        return frame.layers.find(l => l.id === s.activeLayerId) || frame.layers[0];
      },

      // === DRAWING ACTIONS ===
      setProjectName: (name) => set({ projectName: name }),
      setGridSize: (size) => {
        if (!GRID_SIZES.includes(size)) return;
        const newFrame = createEmptyFrame(`frame-0`, size);
        set({
          gridSize: size,
          frames: [newFrame],
          currentFrameIndex: 0,
          activeLayerId: newFrame.layers[0].id,
          undoStack: [],
          redoStack: [],
        });
      },
      setTool: (tool) => set({ currentTool: tool }),
      setColor: (color) => {
        const s = get();
        const recent = [color, ...s.recentColors.filter(c => c !== color)].slice(0, 10);
        set({ currentColor: color, recentColors: recent });
      },
      setMirrorMode: (mode) => set({ mirrorMode: mode }),
      setSprayDensity: (d) => set({ sprayDensity: d }),
      setRectFill: (fill) => set({ rectFill: fill }),
      setCircleFill: (fill) => set({ circleFill: fill }),
      setZoom: (z) => set({ zoom: Math.max(0.5, Math.min(32, z)) }),
      setPan: (x, y) => set({ panX: x, panY: y }),
      resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
      toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
      toggleOnionSkin: () => set(s => ({ showOnionSkin: !s.showOnionSkin })),
      setFps: (fps) => set({ fps: Math.max(1, Math.min(30, fps)) }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackFrame: (frame) => set({ playbackFrame: frame }),
      setExportScale: (scale) => set({ exportScale: scale }),

      setPixel: (x, y, color) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const layer = frame.layers.find(l => l.id === s.activeLayerId);
        if (!layer || layer.locked) return;
        const idx = y * s.gridSize + x;
        if (idx < 0 || idx >= s.gridSize * s.gridSize) return;
        const newPixels = [...layer.pixels];
        newPixels[idx] = color;
        const newLayers = frame.layers.map(l =>
          l.id === s.activeLayerId ? { ...l, pixels: newPixels } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
        // Track for game
        if (color) {
          get().trackPixelDrawn();
          get().trackColorUsed(color);
        }
        get().trackToolUsed(s.currentTool);
      },
      setPixels: (coords, color) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const layer = frame.layers.find(l => l.id === s.activeLayerId);
        if (!layer || layer.locked) return;
        const newPixels = [...layer.pixels];
        let drawn = 0;
        for (const [x, y] of coords) {
          const idx = y * s.gridSize + x;
          if (idx >= 0 && idx < s.gridSize * s.gridSize) {
            if (color && !newPixels[idx]) drawn++;
            newPixels[idx] = color;
          }
        }
        const newLayers = frame.layers.map(l =>
          l.id === s.activeLayerId ? { ...l, pixels: newPixels } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
        if (drawn > 0) {
          get().trackPixelDrawn();
        }
      },
      floodFill: (x, y, color) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const layer = frame.layers.find(l => l.id === s.activeLayerId);
        if (!layer || layer.locked) return;
        const gs = s.gridSize;
        const startIdx = y * gs + x;
        const targetColor = layer.pixels[startIdx];
        if (targetColor === color) return;
        const newPixels = [...layer.pixels];
        const stack = [startIdx];
        const visited = new Set<number>();
        let filled = 0;
        while (stack.length) {
          const idx = stack.pop()!;
          if (visited.has(idx)) continue;
          if (newPixels[idx] !== targetColor) continue;
          visited.add(idx);
          newPixels[idx] = color;
          filled++;
          const row = Math.floor(idx / gs);
          const col = idx % gs;
          if (col > 0) stack.push(idx - 1);
          if (col < gs - 1) stack.push(idx + 1);
          if (row > 0) stack.push(idx - gs);
          if (row < gs - 1) stack.push(idx + gs);
        }
        const newLayers = frame.layers.map(l =>
          l.id === s.activeLayerId ? { ...l, pixels: newPixels } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
        if (filled > 0) get().trackPixelDrawn();
        get().trackToolUsed('fill');
      },

      addLayer: () => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayer = createEmptyLayer(`layer-${Date.now()}`, `Слой ${frame.layers.length + 1}`, s.gridSize);
        const newLayers = [...frame.layers, newLayer];
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames, activeLayerId: newLayer.id });
      },
      deleteLayer: (id) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        if (frame.layers.length <= 1) return;
        const newLayers = frame.layers.filter(l => l.id !== id);
        const newActiveId = newLayers[0]?.id || '';
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames, activeLayerId: newActiveId });
      },
      setActiveLayer: (id) => set({ activeLayerId: id }),
      toggleLayerVisibility: (id) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayers = frame.layers.map(l =>
          l.id === id ? { ...l, visible: !l.visible } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },
      toggleLayerLock: (id) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayers = frame.layers.map(l =>
          l.id === id ? { ...l, locked: !l.locked } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },
      setLayerOpacity: (id, opacity) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayers = frame.layers.map(l =>
          l.id === id ? { ...l, opacity } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },
      setLayerBlendMode: (id, mode) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayers = frame.layers.map(l =>
          l.id === id ? { ...l, blendMode: mode } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },
      renameLayer: (id, name) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const newLayers = frame.layers.map(l =>
          l.id === id ? { ...l, name } : l
        );
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },
      moveLayer: (id, direction) => {
        const s = get();
        const frame = s.frames[s.currentFrameIndex];
        const idx = frame.layers.findIndex(l => l.id === id);
        if (idx === -1) return;
        const newIdx = direction === 'up' ? idx + 1 : idx - 1;
        if (newIdx < 0 || newIdx >= frame.layers.length) return;
        const newLayers = [...frame.layers];
        [newLayers[idx], newLayers[newIdx]] = [newLayers[newIdx], newLayers[idx]];
        const newFrames = s.frames.map((f, i) =>
          i === s.currentFrameIndex ? { ...f, layers: newLayers } : f
        );
        set({ frames: newFrames });
      },

      addFrame: () => {
        const s = get();
        const newFrame = createEmptyFrame(`frame-${Date.now()}`, s.gridSize);
        const newFrames = [...s.frames, newFrame];
        set({ frames: newFrames, currentFrameIndex: newFrames.length - 1, activeLayerId: newFrame.layers[0].id });
      },
      duplicateFrame: (index) => {
        const s = get();
        const frame = s.frames[index];
        if (!frame) return;
        const newFrame = cloneFrame(frame);
        newFrame.id = `frame-${Date.now()}`;
        newFrame.layers = frame.layers.map(l => ({
          ...l,
          id: `layer-${Date.now()}-${Math.random()}`,
          pixels: [...l.pixels],
        }));
        const newFrames = [...s.frames.slice(0, index + 1), newFrame, ...s.frames.slice(index + 1)];
        set({ frames: newFrames, currentFrameIndex: index + 1, activeLayerId: newFrame.layers[0].id });
      },
      deleteFrame: (index) => {
        const s = get();
        if (s.frames.length <= 1) return;
        const newFrames = s.frames.filter((_, i) => i !== index);
        const newIndex = Math.min(s.currentFrameIndex, newFrames.length - 1);
        set({
          frames: newFrames,
          currentFrameIndex: newIndex,
          activeLayerId: newFrames[newIndex]?.layers[0]?.id || '',
        });
      },
      setCurrentFrame: (index) => {
        const s = get();
        if (index < 0 || index >= s.frames.length) return;
        const frame = s.frames[index];
        set({
          currentFrameIndex: index,
          activeLayerId: frame.layers[0]?.id || '',
        });
      },

      pushHistory: () => {
        const s = get();
        const state: HistoryState = {
          frames: cloneFrames(s.frames),
          currentFrameIndex: s.currentFrameIndex,
          activeLayerId: s.activeLayerId,
        };
        const newStack = [...s.undoStack, state].slice(-100);
        set({ undoStack: newStack, redoStack: [] });
      },
      undo: () => {
        const s = get();
        if (s.undoStack.length === 0) return;
        const currentState: HistoryState = {
          frames: cloneFrames(s.frames),
          currentFrameIndex: s.currentFrameIndex,
          activeLayerId: s.activeLayerId,
        };
        const newUndo = [...s.undoStack];
        const prevState = newUndo.pop()!;
        set({
          frames: prevState.frames,
          currentFrameIndex: prevState.currentFrameIndex,
          activeLayerId: prevState.activeLayerId,
          undoStack: newUndo,
          redoStack: [...s.redoStack, currentState],
        });
      },
      redo: () => {
        const s = get();
        if (s.redoStack.length === 0) return;
        const currentState: HistoryState = {
          frames: cloneFrames(s.frames),
          currentFrameIndex: s.currentFrameIndex,
          activeLayerId: s.activeLayerId,
        };
        const newRedo = [...s.redoStack];
        const nextState = newRedo.pop()!;
        set({
          frames: nextState.frames,
          currentFrameIndex: nextState.currentFrameIndex,
          activeLayerId: nextState.activeLayerId,
          undoStack: [...s.undoStack, currentState],
          redoStack: newRedo,
        });
      },

      clearProject: () => {
        const newFrame = createEmptyFrame('frame-0', 16);
        set({
          gridSize: 16,
          frames: [newFrame],
          currentFrameIndex: 0,
          activeLayerId: newFrame.layers[0].id,
          undoStack: [],
          redoStack: [],
          isPlaying: false,
        });
      },
      loadProject: (data) => {
        if (!data || !data.frames) return;
        set({
          projectName: data.name || 'Imported',
          gridSize: data.gridSize || 16,
          frames: data.frames,
          currentFrameIndex: data.currentFrameIndex || 0,
          activeLayerId: data.activeLayerId || data.frames[0]?.layers[0]?.id || '',
          undoStack: [],
          redoStack: [],
        });
      },

      // === GAME ACTIONS ===
      setGameMode: (mode) => set({ gameMode: mode }),
      startChallenge: (challenge) => {
        const newFrame = createEmptyFrame('frame-0', challenge.gridSize || 16);
        set({
          gameMode: 'challenge',
          activeChallenge: challenge,
          challengeTimer: challenge.timeLimit || 0,
          challengeActive: true,
          gridSize: challenge.gridSize || 16,
          frames: [newFrame],
          currentFrameIndex: 0,
          activeLayerId: newFrame.layers[0].id,
          undoStack: [],
          redoStack: [],
        });
      },
      completeChallenge: () => {
        const s = get();
        if (!s.activeChallenge || !s.challengeActive) return;
        const reward = s.activeChallenge.xpReward;
        const completed = [...s.playerStats.challengesCompleted];
        if (!completed.includes(s.activeChallenge.id)) {
          completed.push(s.activeChallenge.id);
        }
        set({
          challengeActive: false,
          gameMode: 'hub',
          playerStats: {
            ...s.playerStats,
            challengesCompleted: completed,
          },
        });
        get().addXp(reward);
        get().checkAchievements();
      },
      failChallenge: () => {
        set({
          challengeActive: false,
          gameMode: 'hub',
          activeChallenge: null,
        });
      },
      tickChallengeTimer: () => {
        const s = get();
        if (!s.challengeActive || s.challengeTimer <= 0) return;
        const newTimer = s.challengeTimer - 1;
        set({ challengeTimer: newTimer });
        if (newTimer <= 0) {
          get().failChallenge();
        }
      },
      addXp: (amount) => {
        const s = get();
        const newXp = s.playerStats.xp + amount;
        const newLevel = getLevelFromXp(newXp);
        set({
          playerStats: {
            ...s.playerStats,
            xp: newXp,
            level: newLevel,
          },
        });
      },
      trackPixelDrawn: () => {
        const s = get();
        set({
          playerStats: {
            ...s.playerStats,
            totalPixelsDrawn: s.playerStats.totalPixelsDrawn + 1,
          },
        });
        get().checkAchievements();
      },
      trackToolUsed: (tool) => {
        const s = get();
        const tools = { ...s.playerStats.toolsUsed };
        tools[tool] = (tools[tool] || 0) + 1;
        set({
          playerStats: {
            ...s.playerStats,
            toolsUsed: tools,
          },
        });
        get().checkAchievements();
      },
      trackColorUsed: (color) => {
        const s = get();
        const colors = [...s.playerStats.colorsUsed];
        if (!colors.includes(color)) {
          colors.push(color);
        }
        set({
          playerStats: {
            ...s.playerStats,
            colorsUsed: colors,
          },
        });
      },
      trackExport: () => {
        const s = get();
        set({
          playerStats: {
            ...s.playerStats,
            totalDrawings: s.playerStats.totalDrawings + 1,
          },
        });
        get().checkAchievements();
      },
      checkAchievements: () => {
        const s = get();
        const stats = s.playerStats;
        const unlocked = [...stats.achievementsUnlocked];
        let newXp = 0;

        const check = (id: string, condition: boolean) => {
          if (condition && !unlocked.includes(id)) {
            unlocked.push(id);
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (ach) newXp += ach.xpReward;
          }
        };

        check('first_pixel', stats.totalPixelsDrawn >= 1);
        check('pixel_100', stats.totalPixelsDrawn >= 100);
        check('pixel_1000', stats.totalPixelsDrawn >= 1000);
        check('pixel_10000', stats.totalPixelsDrawn >= 10000);
        check('tool_collector', Object.keys(stats.toolsUsed).length >= 9);
        check('challenge_1', stats.challengesCompleted.length >= 1);
        check('challenge_5', stats.challengesCompleted.length >= 5);
        check('challenge_all', stats.challengesCompleted.length >= CHALLENGES.length);
        check('level_5', stats.level >= 5);
        check('level_10', stats.level >= 10);
        check('level_20', stats.level >= 20);
        check('animator', s.frames.length >= 3);
        check('layer_user', s.frames[s.currentFrameIndex]?.layers.length >= 3);
        check('streak_3', stats.streakDays >= 3);
        check('streak_7', stats.streakDays >= 7);
        check('export_first', stats.totalDrawings >= 1);

        if (newXp > 0) {
          set({
            playerStats: {
              ...stats,
              achievementsUnlocked: unlocked,
            },
          });
          get().addXp(newXp);
        } else {
          set({
            playerStats: {
              ...stats,
              achievementsUnlocked: unlocked,
            },
          });
        }
      },
      toggleAchievements: () => {
        const s = get();
        set({ showAchievements: !s.showAchievements });
      },
      updateStreak: () => {
        const s = get();
        const today = new Date().toISOString().split('T')[0];
        const last = s.playerStats.lastPlayedDate;
        if (today === last) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const streak = last === yesterdayStr ? s.playerStats.streakDays + 1 : 1;
        set({
          playerStats: {
            ...s.playerStats,
            streakDays: streak,
            lastPlayedDate: today,
          },
        });
        get().checkAchievements();
      },

      // === BATTLE ACTIONS ===
      startBattle: (theme) => {
        const newFrame = createEmptyFrame('frame-0', 16);
        set({
          gameMode: 'battle',
          battleTheme: theme,
          battlePhase: 'draw',
          battleCurrentPlayer: 1,
          battleTimeLeft: 60,
          battlePlayer1Drawing: null,
          battlePlayer2Drawing: null,
          gridSize: 16,
          frames: [newFrame],
          currentFrameIndex: 0,
          activeLayerId: newFrame.layers[0].id,
          undoStack: [],
          redoStack: [],
        });
      },
      setBattlePhase: (phase) => set({ battlePhase: phase }),
      switchBattlePlayer: () => {
        const s = get();
        if (s.battleCurrentPlayer === 1) {
          set({ battleCurrentPlayer: 2, battleTimeLeft: 60 });
        } else {
          set({ battlePhase: 'vote' });
        }
      },
      tickBattleTimer: () => {
        const s = get();
        if (s.battleTimeLeft <= 0) return;
        set({ battleTimeLeft: s.battleTimeLeft - 1 });
      },
      setBattleTheme: (theme) => set({ battleTheme: theme }),
      captureBattleDrawing: (player, dataUrl) => {
        if (player === 1) {
          set({ battlePlayer1Drawing: dataUrl });
        } else {
          set({ battlePlayer2Drawing: dataUrl });
        }
      },
    }),
    {
      name: 'pixeldrop-game',
      partialize: (state) => ({
        projectName: state.projectName,
        gridSize: state.gridSize,
        frames: state.frames,
        currentFrameIndex: state.currentFrameIndex,
        activeLayerId: state.activeLayerId,
        currentColor: state.currentColor,
        recentColors: state.recentColors,
        showGrid: state.showGrid,
        fps: state.fps,
        playerStats: state.playerStats,
      }),
    }
  )
);

// Initialize
const store = useStore.getState();
if (!store.activeLayerId && store.frames[0]?.layers[0]) {
  useStore.setState({ activeLayerId: store.frames[0].layers[0].id });
}
store.updateStreak();
