import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import {
  Play, Pause, Plus, Copy, Trash2, Film
} from 'lucide-react';

export default function Timeline() {
  const frames = useStore(s => s.frames);
  const currentFrameIndex = useStore(s => s.currentFrameIndex);
  const isPlaying = useStore(s => s.isPlaying);
  const fps = useStore(s => s.fps);
  const playbackFrame = useStore(s => s.playbackFrame);
  const addFrame = useStore(s => s.addFrame);
  const duplicateFrame = useStore(s => s.duplicateFrame);
  const deleteFrame = useStore(s => s.deleteFrame);
  const setCurrentFrame = useStore(s => s.setCurrentFrame);
  const setIsPlaying = useStore(s => s.setIsPlaying);
  const setFps = useStore(s => s.setFps);
  const setPlaybackFrame = useStore(s => s.setPlaybackFrame);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const s = useStore.getState();
        const next = (s.playbackFrame + 1) % s.frames.length;
        setPlaybackFrame(next);
      }, 1000 / fps);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, fps, setPlaybackFrame]);

  // Render thumbnail for a frame
  const renderThumbnail = useCallback((frameIndex: number) => {
    const frame = frames[frameIndex];
    if (!frame) return '';

    const gs = useStore.getState().gridSize;
    const size = 32; // thumbnail size
    const cellSize = Math.floor(size / gs);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#1a1928';
    ctx.fillRect(0, 0, size, size);

    // Checkerboard
    for (let row = 0; row < gs; row++) {
      for (let col = 0; col < gs; col++) {
        const light = (col + row) % 2 === 0;
        ctx.fillStyle = light ? '#252438' : '#1f1e2e';
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }

    // Draw layers
    for (const layer of frame.layers) {
      if (!layer.visible) continue;
      for (let idx = 0; idx < layer.pixels.length; idx++) {
        const color = layer.pixels[idx];
        if (!color) continue;
        const col = idx % gs;
        const row = Math.floor(idx / gs);
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = color;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    ctx.globalAlpha = 1;

    return canvas.toDataURL('image/png');
  }, [frames]);

  const thumbnails = useRef<Map<number, string>>(new Map());

  // Update thumbnails when frames change
  useEffect(() => {
    frames.forEach((_, i) => {
      thumbnails.current.set(i, renderThumbnail(i));
    });
  }, [frames, renderThumbnail]);

  return (
    <div className="flex flex-col gap-2 p-3 bg-[#1a1928] rounded-2xl border border-[#2a2940]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#8887a0] uppercase tracking-wider font-bold flex items-center gap-1.5">
          <Film size={12} />
          Анимация ({frames.length} кадров)
        </span>
        <div className="flex items-center gap-2">
          {/* FPS control */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8887a0]">FPS</span>
            <input
              type="range"
              min="1"
              max="30"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-16 h-1 accent-[#ff6b35]"
            />
            <span className="text-[10px] text-[#fffffe] font-mono w-5">{fps}</span>
          </div>
        </div>
      </div>

      {/* Frame strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {frames.map((_, index) => {
          const isActive = !isPlaying ? index === currentFrameIndex : index === playbackFrame;
          const thumb = thumbnails.current.get(index) || '';

          return (
            <motion.div
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isPlaying) {
                  setPlaybackFrame(index);
                } else {
                  setCurrentFrame(index);
                }
              }}
              className={`
                relative flex-shrink-0 w-12 h-12 rounded-lg border-2 overflow-hidden cursor-pointer transition-all
                ${isActive
                  ? 'border-[#ff6b35] shadow-[0_0_12px_rgba(255,107,53,0.4)]'
                  : 'border-[#2a2940] hover:border-[#3a3960]'
                }
              `}
            >
              {thumb ? (
                <img src={thumb} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#252438]" />
              )}
              <span className="absolute bottom-0 right-0 text-[8px] bg-black/60 text-white px-1 rounded-tl">
                {index + 1}
              </span>
            </motion.div>
          );
        })}

        {/* Add frame button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={addFrame}
          className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-[#2a2940] hover:border-[#06d6a0] text-[#8887a0] hover:text-[#06d6a0] flex items-center justify-center transition-all"
          title="Добавить кадр"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all
            ${isPlaying
              ? 'bg-[#ff6b35]/15 border border-[#ff6b35] text-[#ff6b35]'
              : 'bg-[#06d6a0]/15 border border-[#06d6a0] text-[#06d6a0]'
            }
          `}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'СТОП' : 'PLAY'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => duplicateFrame(currentFrameIndex)}
          className="h-8 px-2 rounded-lg bg-[#252438] border border-[#2a2940] hover:border-[#3a86ff] text-[#8887a0] hover:text-[#3a86ff] flex items-center gap-1 text-xs transition-all"
          title="Дублировать кадр"
        >
          <Copy size={12} />
          <span className="hidden sm:inline">Дубль</span>
        </motion.button>

        {frames.length > 1 && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => deleteFrame(currentFrameIndex)}
            className="h-8 px-2 rounded-lg bg-[#252438] border border-[#2a2940] hover:border-red-400 text-[#8887a0] hover:text-red-400 flex items-center gap-1 text-xs transition-all"
            title="Удалить кадр"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Удалить</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
