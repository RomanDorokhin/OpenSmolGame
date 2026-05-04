import { useStore, ACHIEVEMENTS } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Trophy, Star, Pencil, Wrench, Flame, Download, Film, Layers, Zap } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Trophy, Star, Pencil, Wrench, Flame, Download, Film, Layers, Zap,
};

export default function AchievementsPanel() {
  const showAchievements = useStore(s => s.showAchievements);
  const toggleAchievements = useStore(s => s.toggleAchievements);
  const playerStats = useStore(s => s.playerStats);

  if (!showAchievements) return null;

  const totalPossible = ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
  const earned = playerStats.achievementsUnlocked.reduce((sum, id) => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return sum + (a?.xpReward || 0);
  }, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={toggleAchievements}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1a1928] border border-[#2a2940] rounded-2xl p-5 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#fffffe]">Достижения</h2>
              <p className="text-xs text-[#8887a0]">{earned} / {totalPossible} XP собрано</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleAchievements}
              className="w-8 h-8 rounded-lg bg-[#252438] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] flex items-center justify-center"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#252438] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#ffd23f] to-[#ff6b35] rounded-full transition-all"
              style={{ width: `${(playerStats.achievementsUnlocked.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>

          {/* Achievements grid */}
          <div className="grid grid-cols-1 gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = playerStats.achievementsUnlocked.includes(ach.id);
              const Icon = iconMap[ach.icon] || Trophy;

              return (
                <motion.div
                  key={ach.id}
                  whileTap={unlocked ? undefined : { scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    unlocked
                      ? 'border-[#ffd23f]/30 bg-[#ffd23f]/5'
                      : 'border-[#2a2940] bg-[#252438]/30 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-[#ffd23f]/20 text-[#ffd23f]' : 'bg-[#2a2940] text-[#8887a0]'
                  }`}>
                    {unlocked ? <Icon size={20} /> : <Lock size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${unlocked ? 'text-[#fffffe]' : 'text-[#8887a0]'}`}>
                      {ach.title}
                    </h4>
                    <p className="text-xs text-[#8887a0] truncate">{ach.description}</p>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${unlocked ? 'text-[#ffd23f]' : 'text-[#555]'}`}>
                    +{ach.xpReward} XP
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
