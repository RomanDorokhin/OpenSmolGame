import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const showGrid = useStore(s => s.showGrid);
  const toggleGrid = useStore(s => s.toggleGrid);
  const fps = useStore(s => s.fps);
  const setFps = useStore(s => s.setFps);
  const [activeTab, setActiveTab] = useState<'general' | 'shortcuts'>('general');

  const shortcuts = [
    { key: 'B', action: 'Карандаш' },
    { key: 'E', action: 'Ластик' },
    { key: 'G', action: 'Заливка' },
    { key: 'L', action: 'Линия' },
    { key: 'R', action: 'Прямоугольник' },
    { key: 'C', action: 'Круг' },
    { key: 'I', action: 'Пипетка' },
    { key: 'M', action: 'Зеркало' },
    { key: 'S', action: 'Спрей' },
    { key: 'Ctrl+Z', action: 'Отменить' },
    { key: 'Ctrl+Shift+Z', action: 'Повторить' },
    { key: 'Ctrl+Scroll', action: 'Масштаб' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1928] border border-[#2a2940] rounded-2xl p-5 w-full max-w-sm shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#fffffe]">Настройки</h2>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#252438] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] flex items-center justify-center transition-all"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[#0f0e17] rounded-xl p-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                  ${activeTab === 'general'
                    ? 'bg-[#252438] text-[#ff6b35] border border-[#2a2940]'
                    : 'text-[#8887a0] hover:text-[#fffffe]'
                  }
                `}
              >
                <Info size={14} />
                Общие
              </button>
              <button
                onClick={() => setActiveTab('shortcuts')}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                  ${activeTab === 'shortcuts'
                    ? 'bg-[#252438] text-[#ff6b35] border border-[#2a2940]'
                    : 'text-[#8887a0] hover:text-[#fffffe]'
                  }
                `}
              >
                <Keyboard size={14} />
                Горячие клавиши
              </button>
            </div>

            {activeTab === 'general' && (
              <div className="flex flex-col gap-4">
                {/* Show grid toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#fffffe]">Показывать сетку</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleGrid}
                    className={`
                      w-12 h-6 rounded-full transition-all relative
                      ${showGrid ? 'bg-[#06d6a0]' : 'bg-[#2a2940]'}
                    `}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white absolute top-0.5"
                      animate={{ left: showGrid ? 26 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                {/* Default FPS */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#fffffe]">FPS анимации по умолчанию</span>
                    <span className="text-sm text-[#ff6b35] font-mono">{fps}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full h-1 accent-[#ff6b35]"
                  />
                </div>

                {/* Info */}
                <div className="p-3 bg-[#0f0e17] rounded-xl border border-[#2a2940]">
                  <p className="text-xs text-[#8887a0]">
                    <span className="text-[#ff6b35] font-bold">PixelDrop</span> — бесплатный pixel art редактор.
                    Все данные хранятся локально в вашем браузере.
                  </p>
                  <p className="text-xs text-[#8887a0] mt-1">
                    Версия 2.0 • Без бэкенда • PWA-ready
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0f0e17] border border-[#2a2940]"
                  >
                    <span className="text-xs text-[#fffffe]">{shortcut.action}</span>
                    <kbd className="px-2 py-0.5 bg-[#252438] border border-[#2a2940] rounded text-[10px] text-[#8887a0] font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
