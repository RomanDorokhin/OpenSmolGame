import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowLeft, User, Crown, Trophy } from 'lucide-react';

export default function PixelBattle() {
  const battleTheme = useStore(s => s.battleTheme);
  const battlePhase = useStore(s => s.battlePhase);
  const battleCurrentPlayer = useStore(s => s.battleCurrentPlayer);
  const battleTimeLeft = useStore(s => s.battleTimeLeft);
  const battlePlayer1Drawing = useStore(s => s.battlePlayer1Drawing);
  const battlePlayer2Drawing = useStore(s => s.battlePlayer2Drawing);
  const tickBattleTimer = useStore(s => s.tickBattleTimer);
  const switchBattlePlayer = useStore(s => s.switchBattlePlayer);
  const setBattlePhase = useStore(s => s.setBattlePhase);
  const setGameMode = useStore(s => s.setGameMode);
  const captureBattleDrawing = useStore(s => s.captureBattleDrawing);
  const addXp = useStore(s => s.addXp);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [voted, setVoted] = useState<1 | 2 | null>(null);

  useEffect(() => {
    if (battlePhase === 'draw') {
      timerRef.current = setInterval(() => {
        tickBattleTimer();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [battlePhase]);

  useEffect(() => {
    if (battleTimeLeft <= 0 && battlePhase === 'draw') {
      // Time's up - capture current drawing
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
        captureBattleDrawing(battleCurrentPlayer, dataUrl);
      }
      if (battleCurrentPlayer === 1) {
        switchBattlePlayer();
      } else {
        setBattlePhase('vote');
      }
    }
  }, [battleTimeLeft]);

  const handleNextPlayer = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png');
      captureBattleDrawing(battleCurrentPlayer, dataUrl);
    }
    if (battleCurrentPlayer === 1) {
      // Clear canvas for player 2
      const newFrame = { id: 'frame-0', layers: [{ id: 'layer-1', name: 'Слой 1', pixels: new Array(256).fill(''), visible: true, opacity: 1, blendMode: 'normal' as const, locked: false }] };
      useStore.setState({
        frames: [newFrame],
        currentFrameIndex: 0,
        activeLayerId: 'layer-1',
        undoStack: [],
        redoStack: [],
      });
      switchBattlePlayer();
    } else {
      setBattlePhase('vote');
    }
  };

  const handleVote = (player: 1 | 2) => {
    setVoted(player);
    setBattlePhase('result');
    addXp(25); // Participation XP
  };

  const handleExit = () => {
    setVoted(null);
    setGameMode('hub');
  };

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      <AnimatePresence>
        {/* Battle UI overlay */}
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          className="pointer-events-auto absolute top-0 left-0 right-0 bg-[#1a1928]/95 backdrop-blur-xl border-b border-[#2a2940] px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleExit}
                className="w-9 h-9 rounded-xl bg-[#252438] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] flex items-center justify-center"
              >
                <ArrowLeft size={18} />
              </motion.button>
              <div>
                <h3 className="text-sm font-bold text-[#fffffe]">Pixel Battle</h3>
                <p className="text-[10px] text-[#8887a0]">Тема: <span className="text-[#ff6b35] font-bold">{battleTheme}</span></p>
              </div>
            </div>

            {battlePhase === 'draw' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]">
                  <User size={14} />
                  <span className="text-xs font-bold">Игрок {battleCurrentPlayer}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${battleTimeLeft <= 10 ? 'border-red-400 bg-red-400/10 text-red-400' : 'border-[#ffd23f] bg-[#ffd23f]/10 text-[#ffd23f]'}`}>
                  <Timer size={14} />
                  <span className="text-sm font-mono font-bold">{battleTimeLeft}s</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNextPlayer}
                  className="px-4 h-9 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] text-white text-xs font-bold"
                >
                  {battleCurrentPlayer === 1 ? 'Следующий игрок' : 'Голосование'}
                </motion.button>
              </div>
            )}

            {battlePhase === 'vote' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#fffffe] font-bold">Кто рисует лучше?</span>
              </div>
            )}

            {battlePhase === 'result' && (
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-[#ffd23f]" />
                <span className="text-sm font-bold text-[#ffd23f]">Победитель выбран!</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Vote overlay */}
      <AnimatePresence>
        {battlePhase === 'vote' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 top-16 bg-[#0f0e17]/90 backdrop-blur-lg flex items-center justify-center p-8"
          >
            <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
              <h2 className="text-2xl font-black text-[#fffffe]">Кто рисует лучше?</h2>
              <p className="text-sm text-[#8887a0]">Тема: <span className="text-[#ff6b35] font-bold">{battleTheme}</span></p>

              <div className="flex gap-4 w-full">
                {/* Player 1 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(1)}
                  className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#1a1928] border-2 border-[#2a2940] hover:border-[#3a86ff] transition-all"
                >
                  <User size={24} className="text-[#3a86ff]" />
                  <span className="text-sm font-bold">Игрок 1</span>
                  {battlePlayer1Drawing && (
                    <img src={battlePlayer1Drawing} alt="Player 1" className="w-full aspect-square rounded-lg object-contain bg-[#252438]" />
                  )}
                </motion.button>

                {/* VS */}
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-black text-[#ff6b35]">VS</span>
                </div>

                {/* Player 2 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(2)}
                  className="flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#1a1928] border-2 border-[#2a2940] hover:border-[#f72585] transition-all"
                >
                  <User size={24} className="text-[#f72585]" />
                  <span className="text-sm font-bold">Игрок 2</span>
                  {battlePlayer2Drawing && (
                    <img src={battlePlayer2Drawing} alt="Player 2" className="w-full aspect-square rounded-lg object-contain bg-[#252438]" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result overlay */}
      <AnimatePresence>
        {battlePhase === 'result' && voted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 top-16 bg-[#0f0e17]/90 backdrop-blur-lg flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Crown size={64} className="text-[#ffd23f]" />
              </motion.div>
              <h2 className="text-3xl font-black text-[#fffffe]">
                Игрок {voted} победил!
              </h2>
              <p className="text-sm text-[#8887a0]">Тема: <span className="text-[#ff6b35] font-bold">{battleTheme}</span></p>
              <div className="flex items-center gap-2 text-[#ffd23f]">
                <Trophy size={18} />
                <span className="text-sm font-bold">+25 XP за участие</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExit}
                className="mt-4 px-8 h-12 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ffd23f] text-white font-bold"
              >
                Вернуться в хаб
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
