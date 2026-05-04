import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { BlendMode } from '@/types';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown,
  Layers as LayersIcon
} from 'lucide-react';

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'add', label: 'Add' },
  { value: 'subtract', label: 'Subtract' },
];

export default function LayersPanel() {
  const frames = useStore(s => s.frames);
  const currentFrameIndex = useStore(s => s.currentFrameIndex);
  const activeLayerId = useStore(s => s.activeLayerId);
  const addLayer = useStore(s => s.addLayer);
  const deleteLayer = useStore(s => s.deleteLayer);
  const setActiveLayer = useStore(s => s.setActiveLayer);
  const toggleLayerVisibility = useStore(s => s.toggleLayerVisibility);
  const toggleLayerLock = useStore(s => s.toggleLayerLock);
  const setLayerOpacity = useStore(s => s.setLayerOpacity);
  const setLayerBlendMode = useStore(s => s.setLayerBlendMode);
  const renameLayer = useStore(s => s.renameLayer);
  const moveLayer = useStore(s => s.moveLayer);

  const currentFrame = frames[currentFrameIndex];
  const layers = currentFrame?.layers || [];

  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleRename = (id: string, name: string) => {
    setEditingName(id);
    setEditValue(name);
  };

  const handleRenameSubmit = (id: string) => {
    if (editValue.trim()) {
      renameLayer(id, editValue.trim());
    }
    setEditingName(null);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#1a1928] rounded-2xl border border-[#2a2940] w-52">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold flex items-center gap-1.5">
          <LayersIcon size={12} />
          Слои ({layers.length})
        </span>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={addLayer}
          className="w-6 h-6 rounded-md bg-[#252438] border border-[#2a2940] hover:border-[#a855f7] text-[#8887a0] hover:text-[#a855f7] flex items-center justify-center transition-all"
          title="Добавить слой"
        >
          <Plus size={14} />
        </motion.button>
      </div>

      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto scrollbar-thin">
        {[...layers].reverse().map((layer, reversedIdx) => {
          const idx = layers.length - 1 - reversedIdx;
          const isActive = layer.id === activeLayerId;

          return (
            <motion.div
              key={layer.id}
              layout
              className={`
                flex flex-col gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer
                ${isActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-[#2a2940] bg-[#252438]/50 hover:border-[#3a3960]'
                }
              `}
              onClick={() => setActiveLayer(layer.id)}
            >
              <div className="flex items-center gap-1.5">
                {/* Visibility */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className={`${layer.visible ? 'text-[#8887a0]' : 'text-[#555]'} hover:text-[#fffffe] transition-colors`}
                >
                  {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </motion.button>

                {/* Name */}
                {editingName === layer.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(layer.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(layer.id); }}
                    className="flex-1 text-xs bg-[#0f0e17] border border-[#a855f7] rounded px-1 py-0.5 text-[#fffffe] outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 text-xs text-[#fffffe] font-semibold truncate select-none"
                    onDoubleClick={() => handleRename(layer.id, layer.name)}
                  >
                    {layer.name}
                  </span>
                )}

                {/* Lock */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                  className={`${layer.locked ? 'text-[#ffd23f]' : 'text-[#8887a0]'} hover:text-[#fffffe] transition-colors`}
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </motion.button>

                {/* Delete */}
                {layers.length > 1 && (
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    className="text-[#8887a0] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </motion.button>
                )}
              </div>

              {/* Opacity slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-[#8887a0] w-8">{Math.round(layer.opacity * 100)}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(layer.opacity * 100)}
                  onChange={(e) => setLayerOpacity(layer.id, parseInt(e.target.value) / 100)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 h-1 accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Blend mode */}
              <select
                value={layer.blendMode}
                onChange={(e) => setLayerBlendMode(layer.id, e.target.value as BlendMode)}
                onClick={(e) => e.stopPropagation()}
                className="text-[9px] bg-[#0f0e17] border border-[#2a2940] rounded text-[#8887a0] px-1 py-0.5 outline-none focus:border-purple-500"
              >
                {BLEND_MODES.map(mode => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>

              {/* Move buttons */}
              <div className="flex gap-1">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }}
                  disabled={idx === layers.length - 1}
                  className="flex-1 h-5 rounded bg-[#0f0e17] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] disabled:opacity-30 flex items-center justify-center transition-all"
                >
                  <ChevronUp size={10} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }}
                  disabled={idx === 0}
                  className="flex-1 h-5 rounded bg-[#0f0e17] border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] disabled:opacity-30 flex items-center justify-center transition-all"
                >
                  <ChevronDown size={10} />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
