import { useStore } from '@/store/useStore';
import { GRID_SIZES } from '@/types';
import { motion } from 'framer-motion';
import { Trash2, Save, Grid3X3 } from 'lucide-react';

interface BottomBarProps {
  onExportOpen: () => void;
}

export default function BottomBar({ onExportOpen }: BottomBarProps) {
  const gridSize = useStore(s => s.gridSize);
  const setGridSize = useStore(s => s.setGridSize);
  const clearProject = useStore(s => s.clearProject);
  const handleGridSizeChange = (size: number) => {
    if (size === gridSize) return;
    if (window.confirm('Смена размера очистит холст. Продолжить?')) {
      setGridSize(size);
    }
  };

  const handleClear = () => {
    if (window.confirm('Очистить весь проект? Это действие нельзя отменить.')) {
      clearProject();
    }
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3 bg-[#0f0e17] border-t border-[#2a2940]">
      {/* Grid size selector */}
      <div className="flex items-center gap-2">
        <Grid3X3 size={12} className="text-[#8887a0]" />
        <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold mr-1">Размер</span>
        <div className="flex gap-1 flex-1">
          {GRID_SIZES.map((size) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleGridSizeChange(size)}
              className={`
                flex-1 h-8 rounded-lg border-2 text-xs font-bold transition-all
                ${gridSize === size
                  ? 'border-[#ff6b35] bg-[#ff6b35] text-white'
                  : 'border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:border-[#3a3960] hover:text-[#fffffe]'
                }
              `}
            >
              {size}×{size}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleClear}
          className="h-10 px-4 rounded-xl bg-[#1a1928] border border-[#2a2940] hover:border-red-400 text-[#8887a0] hover:text-red-400 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
        >
          <Trash2 size={14} />
          Очистить
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onExportOpen}
          className="flex-[1.5] h-10 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #ffd23f)',
            color: '#fff',
          }}
        >
          <Save size={14} />
          Сохранить / Экспорт
        </motion.button>
      </div>
    </div>
  );
}
