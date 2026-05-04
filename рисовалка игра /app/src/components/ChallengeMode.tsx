import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Timer, Trophy, ArrowLeft, Zap } from 'lucide-react';

export default function ChallengeMode() {
  const activeChallenge = useStore(s => s.activeChallenge);
  const challengeTimer = useStore(s => s.challengeTimer);
  const challengeActive = useStore(s => s.challengeActive);
  const completeChallenge = useStore(s => s.completeChallenge);
  const failChallenge = useStore(s => s.failChallenge);
  const tickChallengeTimer = useStore(s => s.tickChallengeTimer);
  const frames = useStore(s => s.frames);
  const currentFrameIndex = useStore(s => s.currentFrameIndex);
  const gridSize = useStore(s => s.gridSize);
  const currentTool = useStore(s => s.currentTool);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (challengeActive && activeChallenge?.timeLimit) {
      timerRef.current = setInterval(() => {
        tickChallengeTimer();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challengeActive, activeChallenge?.timeLimit]);

  // Check challenge conditions
  const checkWinCondition = () => {
    if (!activeChallenge) return false;
    const frame = frames[currentFrameIndex];
    if (!frame) return false;

    // Check non-empty canvas
    const hasDrawing = frame.layers.some(l => l.pixels.some(p => p !== ''));
    if (!hasDrawing) return false;

    // Tool requirement
    if (activeChallenge.toolRequired && activeChallenge.toolRequired !== currentTool) {
      // Not checking in real-time, player needs to use the tool
    }

    // Grid size
    if (activeChallenge.gridSize && gridSize !== activeChallenge.gridSize) {
      return false;
    }

    // Min layers
    if (activeChallenge.minLayers && frame.layers.length < activeChallenge.minLayers) {
      return false;
    }

    // Min frames
    if (activeChallenge.minFrames && frames.length < activeChallenge.minFrames) {
      return false;
    }

    return true;
  };

  const handleComplete = () => {
    if (checkWinCondition()) {
      completeChallenge();
    } else {
      alert('Условия челленджа не выполнены! Проверь требования и попробуй снова.');
    }
  };

  const handleGiveUp = () => {
    failChallenge();
  };

  if (!activeChallenge) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Top challenge bar */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="pointer-events-auto absolute top-0 left-0 right-0 bg-[#1a1928]/95 backdrop-blur-xl border-b border-[#2a2940] px-4 py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleGiveUp}
              className="w-9 h-9 rounded-xl bg-[#252438] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div>
              <h3 className="text-sm font-bold text-[#fffffe]">{activeChallenge.title}</h3>
              <p className="text-[10px] text-[#8887a0]">{activeChallenge.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {activeChallenge.timeLimit ? (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${challengeTimer <= 10 ? 'border-red-400 bg-red-400/10 text-red-400' : 'border-[#ffd23f] bg-[#ffd23f]/10 text-[#ffd23f]'}`}>
                <Timer size={14} />
                <span className="text-sm font-mono font-bold">{challengeTimer}s</span>
              </div>
            ) : null}

            {/* XP Reward */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]">
              <Zap size={14} />
              <span className="text-xs font-bold">+{activeChallenge.xpReward}</span>
            </div>

            {/* Complete button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleComplete}
              className="px-4 h-9 rounded-xl bg-gradient-to-r from-[#06d6a0] to-[#118ab2] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Trophy size={14} />
              Завершить
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
