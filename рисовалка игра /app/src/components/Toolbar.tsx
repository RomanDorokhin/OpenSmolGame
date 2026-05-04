import { useStore } from '@/store/useStore';
import { TOOL_CONFIGS } from '@/types';
import {
  Pencil, Eraser, PaintBucket, Minus, Square, Circle,
  Pipette, FlipHorizontal, SprayCan, Undo2, Redo2, Grid3X3,
  ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ElementType> = {
  Pencil, Eraser, PaintBucket, Minus, Square, Circle,
  Pipette, FlipHorizontal, SprayCan,
};

export default function Toolbar() {
  const currentTool = useStore(s => s.currentTool);
  const mirrorMode = useStore(s => s.mirrorMode);
  const zoom = useStore(s => s.zoom);
  const showGrid = useStore(s => s.showGrid);
  const setTool = useStore(s => s.setTool);
  const setMirrorMode = useStore(s => s.setMirrorMode);
  const toggleGrid = useStore(s => s.toggleGrid);
  const undo = useStore(s => s.undo);
  const redo = useStore(s => s.redo);
  const setZoom = useStore(s => s.setZoom);
  const resetView = useStore(s => s.resetView);

  const handleToolClick = (toolId: string) => {
    if (toolId === 'mirror') {
      const modes = ['none', 'x', 'y', 'both'] as const;
      const currentIdx = modes.indexOf(mirrorMode);
      const nextIdx = (currentIdx + 1) % modes.length;
      setMirrorMode(modes[nextIdx]);
      if (currentTool !== 'mirror') {
        setTool('mirror');
      }
    } else {
      setTool(toolId as any);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 p-1.5">
      {/* Tools */}
      <div className="flex flex-col gap-1">
        {TOOL_CONFIGS.map((tool) => {
          const Icon = iconMap[tool.icon];
          const isActive = currentTool === tool.id;
          const isMirror = tool.id === 'mirror';
          const mirrorLabel = isMirror && mirrorMode !== 'none' ? ` (${mirrorMode})` : '';

          return (
            <motion.button
              key={tool.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleToolClick(tool.id)}
              title={`${tool.name}${mirrorLabel}${tool.id !== 'mirror' ? ` (${tool.id[0].toUpperCase()})` : ''}`}
              className={`
                w-10 h-10 rounded-xl border-2 flex items-center justify-center
                transition-all duration-150 relative
                ${isActive
                  ? 'border-purple-500 bg-purple-500/15 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960]'
                }
              `}
            >
              {Icon && <Icon size={18} strokeWidth={2} />}
              {isMirror && mirrorMode !== 'none' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                  {mirrorMode === 'both' ? '2' : '1'}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="h-px bg-[#2a2940] my-1" />

      {/* View controls */}
      <div className="flex flex-col gap-1">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setZoom(zoom * 1.2)}
          className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Увеличить"
        >
          <ZoomIn size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setZoom(zoom * 0.8)}
          className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Уменьшить"
        >
          <ZoomOut size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={resetView}
          className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Сбросить вид"
        >
          <Maximize size={16} />
        </motion.button>
      </div>

      <div className="h-px bg-[#2a2940] my-1" />

      {/* Grid toggle */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={toggleGrid}
        className={`
          w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all
          ${showGrid
            ? 'border-[#ffd23f] bg-[#ffd23f]/10 text-[#ffd23f]'
            : 'border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960]'
          }
        `}
        title="Сетка (G)"
      >
        <Grid3X3 size={16} />
      </motion.button>

      {/* Undo/Redo */}
      <div className="flex flex-col gap-1 mt-auto">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={undo}
          className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Отменить (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={redo}
          className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Повторить (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </motion.button>
      </div>
    </div>
  );
}
