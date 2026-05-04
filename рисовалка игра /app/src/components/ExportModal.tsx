import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Image, Film, LayoutGrid, Upload } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const frames = useStore(s => s.frames);
  const currentFrameIndex = useStore(s => s.currentFrameIndex);
  const gridSize = useStore(s => s.gridSize);
  const projectName = useStore(s => s.projectName);
  const [exportScale, setExportScale] = useState(8);
  const [activeTab, setActiveTab] = useState<'png' | 'gif' | 'sprite'>('png');
  const [isExporting] = useState(false);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const scales = [1, 4, 8, 16, 32];

  const renderFrameToCanvas = (frameIndex: number, canvas: HTMLCanvasElement, scale: number) => {
    const frame = frames[frameIndex];
    if (!frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;

    // Background
    ctx.fillStyle = '#1a1928';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Checkerboard
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const light = (col + row) % 2 === 0;
        ctx.fillStyle = light ? '#252438' : '#1f1e2e';
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }

    // Draw layers
    for (const layer of frame.layers) {
      if (!layer.visible) continue;
      for (let idx = 0; idx < layer.pixels.length; idx++) {
        const color = layer.pixels[idx];
        if (!color) continue;
        const col = idx % gridSize;
        const row = Math.floor(idx / gridSize);
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = color;
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }
    ctx.globalAlpha = 1;
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    renderFrameToCanvas(currentFrameIndex, canvas, exportScale);

    const link = document.createElement('a');
    link.download = `${projectName}_${gridSize}x${gridSize}@${exportScale}x.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onClose();
  };

  const exportSpriteSheet = () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize * exportScale * frames.length;
    canvas.height = gridSize * exportScale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frames.forEach((_, i) => {
      const frameCanvas = document.createElement('canvas');
      renderFrameToCanvas(i, frameCanvas, exportScale);
      ctx.drawImage(frameCanvas, i * gridSize * exportScale, 0);
    });

    const link = document.createElement('a');
    link.download = `${projectName}_spritesheet_${frames.length}f@${exportScale}x.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onClose();
  };

  const saveProject = () => {
    const data = {
      name: projectName,
      gridSize,
      frames,
      currentFrameIndex,
      version: 1,
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `${projectName}.pixeldrop`;
    link.href = URL.createObjectURL(blob);
    link.click();
    onClose();
  };

  const loadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        useStore.getState().loadProject(data);
        onClose();
      } catch (err) {
        alert('Ошибка загрузки файла');
      }
    };
    reader.readAsText(file);
  };

  // Preview
  const updatePreview = () => {
    if (previewRef.current) {
      renderFrameToCanvas(currentFrameIndex, previewRef.current, 4);
    }
  };

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
            className="bg-[#1a1928] border border-[#2a2940] rounded-2xl p-5 w-full max-w-md shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#fffffe]">Экспорт и сохранение</h2>
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
              {[
                { id: 'png' as const, label: 'PNG', icon: Image },
                { id: 'gif' as const, label: 'Спрайт', icon: LayoutGrid },
                { id: 'sprite' as const, label: 'Проект', icon: Film },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); updatePreview(); }}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                    ${activeTab === tab.id
                      ? 'bg-[#252438] text-[#ff6b35] border border-[#2a2940]'
                      : 'text-[#8887a0] hover:text-[#fffffe]'
                    }
                  `}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scale selector */}
            <div className="mb-4">
              <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold">Масштаб экспорта</span>
              <div className="flex gap-1.5 mt-1.5">
                {scales.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExportScale(s)}
                    className={`
                      flex-1 h-8 rounded-lg border-2 text-xs font-bold transition-all
                      ${exportScale === s
                        ? 'border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]'
                        : 'border-[#2a2940] bg-[#0f0e17] text-[#8887a0] hover:border-[#3a3960]'
                      }
                    `}
                  >
                    {s}x
                  </motion.button>
                ))}
              </div>
              <span className="text-[10px] text-[#8887a0] mt-1 block">
                Размер: {gridSize * exportScale}×{gridSize * exportScale}px
              </span>
            </div>

            {/* Preview */}
            <div className="flex justify-center mb-4">
              <canvas
                ref={previewRef}
                className="rounded-lg border border-[#2a2940]"
                style={{ width: 128, height: 128, imageRendering: 'pixelated' }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {activeTab === 'png' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={exportPNG}
                  className="h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #ff6b35, #ffd23f)', color: '#fff' }}
                >
                  <Download size={16} />
                  Скачать PNG
                </motion.button>
              )}

              {activeTab === 'gif' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={exportSpriteSheet}
                  disabled={isExporting}
                  className="h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-[#06d6a0] text-[#0f2e27] disabled:opacity-50 transition-all"
                >
                  <Download size={16} />
                  {isExporting ? 'Экспорт...' : 'Скачать спрайт-лист'}
                </motion.button>
              )}

              {activeTab === 'sprite' && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={saveProject}
                    className="h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
                    style={{ background: 'linear-gradient(135deg, #3a86ff, #06d6a0)', color: '#fff' }}
                  >
                    <Download size={16} />
                    Сохранить проект (.pixeldrop)
                  </motion.button>
                  <label className="h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold bg-[#252438] border border-[#2a2940] hover:border-[#a855f7] text-[#8887a0] hover:text-[#a855f7] cursor-pointer transition-all">
                    <Upload size={16} />
                    Загрузить проект
                    <input type="file" accept=".pixeldrop,.json" onChange={loadProject} className="sr-only" />
                  </label>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
