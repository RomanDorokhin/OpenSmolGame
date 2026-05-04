import { useStore } from '@/store/useStore';
import { CHALLENGES } from '@/store/useStore';
import { motion } from 'framer-motion';
import {
  Palette, Sword, Trophy, Zap, Target, Flame,
  Star, Layers, Film, CheckCircle2, ChevronRight,
  Lock
} from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
  Palette, Sword, Trophy, Zap, Target, Flame, Star, Layers, Film, Lock,
  Pencil: Palette, Minimize2: Target, Maximize2: Target, SprayCan: Zap,
  FlipHorizontal: Layers, PaintBucket: Palette, Minus: Zap, Circle: Target,
};

export default function GameHub() {
  const setGameModeFn = useStore(s => s.setGameMode);
  const playerStats = useStore(s => s.playerStats);
  const startChallenge = useStore(s => s.startChallenge);
  const startBattle = useStore(s => s.startBattle);
  const toggleAchievements = useStore(s => s.toggleAchievements);

  const [selectedTab, setSelectedTab] = useState<'modes' | 'challenges'>('modes');

  const battleThemes = ['Кот', 'Ракета', 'Цветок', 'Монстр', 'Пицца', 'Робот', 'Дерево', 'Дом'];

  const getLevelProgress = () => {
    const xp = playerStats.xp;
    const level = playerStats.level;
    const xpForCurrent = 100 * Math.pow(1.5, level - 1);
    const xpForPrev = level > 1 ? 100 * Math.pow(1.5, level - 2) : 0;
    const inLevel = xp - xpForPrev;
    const needed = xpForCurrent;
    return { percent: Math.min(100, (inLevel / needed) * 100), inLevel, needed };
  };

  const progress = getLevelProgress();

  const handleSandbox = () => {
    const newFrame = { id: 'frame-0', layers: [{ id: 'layer-1', name: 'Слой 1', pixels: new Array(256).fill(''), visible: true, opacity: 1, blendMode: 'normal' as const, locked: false }] };
    setGameModeFn('sandbox');
    useStore.setState({
      gridSize: 16,
      frames: [newFrame],
      currentFrameIndex: 0,
      activeLayerId: 'layer-1',
      projectName: 'Untitled',
    });
  };

  const handleDaily = () => {
    const today = new Date().getDay();
    const daily = CHALLENGES[today % CHALLENGES.length];
    startChallenge({ ...daily, title: 'Ежедневный: ' + daily.title, type: 'daily' });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0f0e17] text-[#fffffe] select-none">
      {/* Top bar with stats */}
      <div className="px-5 py-4 bg-[#1a1928] border-b border-[#2a2940] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ffd23f] flex items-center justify-center text-lg font-black text-white">
            {playerStats.level}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold">Уровень {playerStats.level}</span>
            <div className="w-32 h-2 bg-[#252438] rounded-full overflow-hidden mt-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-[9px] text-[#8887a0]">{Math.floor(progress.inLevel)} / {Math.floor(progress.needed)} XP</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#ffd23f]">
            <Flame size={16} />
            <span className="text-sm font-bold">{playerStats.streakDays}д</span>
          </div>
          <div className="flex items-center gap-1 text-[#a855f7]">
            <Star size={16} />
            <span className="text-sm font-bold">{playerStats.xp}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleAchievements}
            className="w-9 h-9 rounded-xl bg-[#252438] border border-[#2a2940] text-[#ffd23f] flex items-center justify-center"
          >
            <Trophy size={16} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title */}
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ff6b35, #ffd23f)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PixelDrop Quest
          </h1>
          <p className="text-sm text-[#8887a0] mt-1">Рисуй. Прокачивай. Побеждай.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('modes')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedTab === 'modes' ? 'bg-[#252438] border border-[#2a2940] text-[#ff6b35]' : 'text-[#8887a0]'}`}
          >
            Режимы
          </button>
          <button
            onClick={() => setSelectedTab('challenges')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedTab === 'challenges' ? 'bg-[#252438] border border-[#2a2940] text-[#ff6b35]' : 'text-[#8887a0]'}`}
          >
            Челленджи ({playerStats.challengesCompleted.length}/{CHALLENGES.length})
          </button>
        </div>

        {selectedTab === 'modes' && (
          <div className="flex flex-col gap-3">
            {/* Sandbox */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSandbox}
              className="w-full p-4 rounded-2xl bg-[#1a1928] border border-[#2a2940] hover:border-[#ff6b35] transition-all text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ff6b35] to-[#ff924c] flex items-center justify-center shrink-0">
                <Palette size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold">Свободное рисование</h3>
                <p className="text-xs text-[#8887a0]">Создавай без ограничений. Все инструменты доступны.</p>
              </div>
              <ChevronRight size={20} className="text-[#8887a0]" />
            </motion.button>

            {/* Daily Challenge */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleDaily}
              className="w-full p-4 rounded-2xl bg-[#1a1928] border border-[#2a2940] hover:border-[#06d6a0] transition-all text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06d6a0] to-[#118ab2] flex items-center justify-center shrink-0">
                <Target size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold">Ежедневный челлендж</h3>
                <p className="text-xs text-[#8887a0]">Новое задание каждый день. Награда: 2x XP!</p>
              </div>
              <ChevronRight size={20} className="text-[#8887a0]" />
            </motion.button>

            {/* Pixel Battle */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const theme = battleThemes[Math.floor(Math.random() * battleThemes.length)];
                startBattle(theme);
              }}
              className="w-full p-4 rounded-2xl bg-[#1a1928] border border-[#2a2940] hover:border-[#a855f7] transition-all text-left flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#f72585] flex items-center justify-center shrink-0">
                <Sword size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold">Pixel Battle</h3>
                <p className="text-xs text-[#8887a0]">Сразись с другом на одном устройстве. Тема: случайная!</p>
              </div>
              <ChevronRight size={20} className="text-[#8887a0]" />
            </motion.button>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="p-3 rounded-xl bg-[#1a1928] border border-[#2a2940] text-center">
                <Palette size={20} className="text-[#ff6b35] mx-auto mb-1" />
                <span className="text-lg font-black">{playerStats.totalPixelsDrawn}</span>
                <p className="text-[9px] text-[#8887a0]">Пикселей</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1928] border border-[#2a2940] text-center">
                <Trophy size={20} className="text-[#ffd23f] mx-auto mb-1" />
                <span className="text-lg font-black">{playerStats.challengesCompleted.length}</span>
                <p className="text-[9px] text-[#8887a0]">Челленджей</p>
              </div>
              <div className="p-3 rounded-xl bg-[#1a1928] border border-[#2a2940] text-center">
                <Star size={20} className="text-[#a855f7] mx-auto mb-1" />
                <span className="text-lg font-black">{playerStats.achievementsUnlocked.length}</span>
                <p className="text-[9px] text-[#8887a0]">Достижений</p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'challenges' && (
          <div className="flex flex-col gap-2">
            {CHALLENGES.map((challenge) => {
              const completed = playerStats.challengesCompleted.includes(challenge.id);
              const Icon = iconMap[challenge.icon] || Zap;
              const diffColor = {
                easy: '#06d6a0',
                medium: '#ffd23f',
                hard: '#ef4444',
              }[challenge.difficulty];

              return (
                <motion.button
                  key={challenge.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!completed) startChallenge(challenge);
                  }}
                  disabled={completed}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                    completed
                      ? 'border-[#06d6a0]/30 bg-[#06d6a0]/5 opacity-60'
                      : 'border-[#2a2940] bg-[#1a1928] hover:border-[#ff6b35]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: diffColor + '20', color: diffColor }}>
                    {completed ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold truncate">{challenge.title}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: diffColor + '20', color: diffColor }}>
                        {challenge.difficulty === 'easy' ? 'Легко' : challenge.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                      </span>
                    </div>
                    <p className="text-xs text-[#8887a0] truncate">{challenge.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#ffd23f]">+{challenge.xpReward} XP</span>
                    {challenge.timeLimit && (
                      <p className="text-[9px] text-[#8887a0]">{challenge.timeLimit}с</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
