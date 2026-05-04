import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { PRESET_COLORS } from '@/types';
import { motion } from 'framer-motion';
import { Pipette, Plus } from 'lucide-react';

export default function Palette() {
  const currentColor = useStore(s => s.currentColor);
  const recentColors = useStore(s => s.recentColors);
  const currentTool = useStore(s => s.currentTool);
  const setColor = useStore(s => s.setColor);
  const setTool = useStore(s => s.setTool);
  const [customColor, setCustomColor] = useState('#ff6b35');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorSelect = (color: string) => {
    setColor(color);
    if (currentTool === 'eraser') {
      setTool('pen');
    }
  };

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setColor(color);
    if (currentTool === 'eraser') {
      setTool('pen');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#1a1928] rounded-2xl border border-[#2a2940]">
      {/* Current color display */}
      <div className="flex items-center gap-2 mb-1">
        <motion.div
          key={currentColor}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-lg border-2 border-white/30 shadow-lg shrink-0"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-xs font-mono text-[#8887a0] uppercase tracking-wider">
          {currentColor}
        </span>
        <span className="ml-auto text-[10px] text-[#8887a0] uppercase tracking-wider font-bold">
          {currentTool === 'eraser' ? 'ЛАСТИК' : 'ЦВЕТ'}
        </span>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold">Недавние</span>
          <div className="flex gap-1 flex-wrap">
            {recentColors.map((color, i) => (
              <motion.button
                key={`${color}-${i}`}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleColorSelect(color)}
                className={`
                  w-6 h-6 rounded-md border-2 transition-all duration-100
                  ${currentColor === color ? 'border-white scale-110 shadow-md' : 'border-transparent hover:border-white/50'}
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preset palette */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold">Палитра</span>
        <div className="grid grid-cols-10 gap-1">
          {PRESET_COLORS.map((color, i) => (
            <motion.button
              key={`${color}-${i}`}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleColorSelect(color)}
              className={`
                aspect-square rounded-md border-2 transition-all duration-100
                ${currentColor === color
                  ? 'border-white scale-110 shadow-md z-10 relative'
                  : 'border-transparent hover:border-white/50 hover:scale-105'
                }
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Custom color picker */}
      <div className="flex items-center gap-2 mt-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => colorInputRef.current?.click()}
          className="flex-1 h-8 rounded-lg bg-[#252438] border border-[#2a2940] hover:border-[#a855f7] flex items-center justify-center gap-1.5 text-xs text-[#8887a0] hover:text-[#a855f7] transition-all"
        >
          <Plus size={12} />
          <span>Свой цвет</span>
        </motion.button>
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={handleCustomColor}
          className="sr-only"
        />
      </div>

      {/* Eraser quick button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setTool('eraser')}
        className={`
          h-8 rounded-lg border-2 flex items-center justify-center gap-1.5 text-xs font-bold transition-all
          ${currentTool === 'eraser'
            ? 'border-purple-500 bg-purple-500/15 text-purple-400'
            : 'border-[#2a2940] bg-[#252438] text-[#8887a0] hover:text-[#fffffe]'
          }
        `}
      >
        <Pipette size={12} />
        ЛАСТИК
      </motion.button>
    </div>
  );
}
