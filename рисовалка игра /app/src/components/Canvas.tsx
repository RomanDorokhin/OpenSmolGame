import { useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import type { Point } from '@/types';

interface CanvasProps {
  width: number;
  height: number;
}

function getBresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const points: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    points.push([x, y]);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return points;
}

function getCirclePixels(cx: number, cy: number, r: number, fill: boolean): [number, number][] {
  const points: [number, number][] = [];
  const visited = new Set<string>();
  const add = (x: number, y: number) => {
    const k = `${x},${y}`;
    if (!visited.has(k)) { visited.add(k); points.push([x, y]); }
  };
  let x = 0, y = r, d = 3 - 2 * r;
  while (x <= y) {
    if (fill) {
      for (let i = cx - x; i <= cx + x; i++) { add(i, cy + y); add(i, cy - y); }
      for (let i = cx - y; i <= cx + y; i++) { add(i, cy + x); add(i, cy - x); }
    } else {
      add(cx + x, cy + y); add(cx - x, cy + y); add(cx + x, cy - y); add(cx - x, cy - y);
      add(cx + y, cy + x); add(cx - y, cy + x); add(cx + y, cy - x); add(cx - y, cy - x);
    }
    x++;
    if (d < 0) { d = d + 4 * x + 6; } else { d = d + 4 * (x - y) + 10; y--; }
  }
  return points;
}

function getRectPixels(x0: number, y0: number, x1: number, y1: number, fill: boolean): [number, number][] {
  const points: [number, number][] = [];
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (fill || x === minX || x === maxX || y === minY || y === maxY) {
        points.push([x, y]);
      }
    }
  }
  return points;
}

function getSprayPixels(cx: number, cy: number, radius: number, density: number, gridSize: number): [number, number][] {
  const points: [number, number][] = [];
  const count = Math.floor(radius * radius * density * 3);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const x = Math.round(cx + Math.cos(angle) * dist);
    const y = Math.round(cy + Math.sin(angle) * dist);
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      points.push([x, y]);
    }
  }
  return points;
}

function getMirroredPoints(x: number, y: number, mode: string, gridSize: number): [number, number][] {
  const points: [number, number][] = [[x, y]];
  const cx = Math.floor((gridSize - 1) / 2);
  const cy = Math.floor((gridSize - 1) / 2);
  if (mode === 'x' || mode === 'both') {
    const mx = gridSize % 2 === 0 ? (cx - x + cx + 1) : (cx * 2 - x);
    if (mx !== x) points.push([mx, y]);
  }
  if (mode === 'y' || mode === 'both') {
    const my = gridSize % 2 === 0 ? (cy - y + cy + 1) : (cy * 2 - y);
    if (my !== y) points.push([x, my]);
  }
  if (mode === 'both') {
    const mx = gridSize % 2 === 0 ? (cx - x + cx + 1) : (cx * 2 - x);
    const my = gridSize % 2 === 0 ? (cy - y + cy + 1) : (cy * 2 - y);
    if (mx !== x && my !== y) points.push([mx, my]);
  }
  return points;
}

export default function Canvas({ width, height }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const pointersRef = useRef<Map<number, PointerEvent>>(new Map());
  const initialPinchDist = useRef(0);
  const initialZoom = useRef(1);

  const [cellSize, setCellSize] = useState(16);
  const [canvasPixelSize, setCanvasPixelSize] = useState(256);

  const gridSize = useStore(s => s.gridSize);
  const frames = useStore(s => s.frames);
  const currentFrameIndex = useStore(s => s.currentFrameIndex);
  const activeLayerId = useStore(s => s.activeLayerId);
  const currentTool = useStore(s => s.currentTool);
  const currentColor = useStore(s => s.currentColor);
  const mirrorMode = useStore(s => s.mirrorMode);
  const sprayDensity = useStore(s => s.sprayDensity);
  const rectFill = useStore(s => s.rectFill);
  const circleFill = useStore(s => s.circleFill);
  const showGrid = useStore(s => s.showGrid);
  const zoom = useStore(s => s.zoom);
  const panX = useStore(s => s.panX);
  const panY = useStore(s => s.panY);
  const isPlaying = useStore(s => s.isPlaying);
  const playbackFrame = useStore(s => s.playbackFrame);

  const setPixel = useStore(s => s.setPixel);
  const setPixels = useStore(s => s.setPixels);
  const floodFill = useStore(s => s.floodFill);
  const setColor = useStore(s => s.setColor);
  const setZoom = useStore(s => s.setZoom);
  const pushHistory = useStore(s => s.pushHistory);
  const setTool = useStore(s => s.setTool);
  const undo = useStore(s => s.undo);

  const currentFrame = frames[isPlaying ? playbackFrame : currentFrameIndex];

  // Calculate cell size from available space
  useEffect(() => {
    const avail = Math.min(width - 24, height - 24);
    const cs = Math.max(4, Math.floor(avail / gridSize));
    setCellSize(cs);
    setCanvasPixelSize(cs * gridSize);
  }, [width, height, gridSize]);

  // Render canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvasPixelSize;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#1a1928';
    ctx.fillRect(0, 0, size, size);

    // Checkerboard for empty cells + draw pixels
    if (currentFrame) {
      const gs = gridSize;
      const cs = cellSize;

      // Composite all visible layers
      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      // Checkerboard background
      for (let row = 0; row < gs; row++) {
        for (let col = 0; col < gs; col++) {
          const light = (col + row) % 2 === 0;
          const r = light ? 0x25 : 0x1f;
          const g = light ? 0x24 : 0x1e;
          const b = light ? 0x38 : 0x2e;
          for (let dy = 0; dy < cs; dy++) {
            for (let dx = 0; dx < cs; dx++) {
              const px = col * cs + dx;
              const py = row * cs + dy;
              const idx = (py * size + px) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = 255;
            }
          }
        }
      }

      // Draw layers (bottom to top)
      for (const layer of currentFrame.layers) {
        if (!layer.visible) continue;
        const opacity = layer.opacity;
        for (let idx = 0; idx < layer.pixels.length; idx++) {
          const color = layer.pixels[idx];
          if (!color) continue;
          // Parse hex color
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const col = idx % gs;
          const row = Math.floor(idx / gs);
          for (let dy = 0; dy < cs; dy++) {
            for (let dx = 0; dx < cs; dx++) {
              const px = col * cs + dx;
              const py = row * cs + dy;
              const pidx = (py * size + px) * 4;
              // Simple alpha blend
              if (opacity < 1) {
                data[pidx] = Math.round(data[pidx] * (1 - opacity) + r * opacity);
                data[pidx + 1] = Math.round(data[pidx + 1] * (1 - opacity) + g * opacity);
                data[pidx + 2] = Math.round(data[pidx + 2] * (1 - opacity) + b * opacity);
              } else {
                data[pidx] = r;
                data[pidx + 1] = g;
                data[pidx + 2] = b;
              }
              data[pidx + 3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Grid lines
      if (showGrid && cs >= 4) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gs; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cs, 0);
          ctx.lineTo(i * cs, size);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * cs);
          ctx.lineTo(size, i * cs);
          ctx.stroke();
        }
      }
    }
  }, [currentFrame, gridSize, cellSize, canvasPixelSize, showGrid]);

  useEffect(() => {
    render();
  }, [render]);

  // Get grid cell from pointer event
  const getCell = useCallback((e: PointerEvent | React.PointerEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasPixelSize / rect.width;
    const scaleY = canvasPixelSize / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(cx / cellSize);
    const row = Math.floor(cy / cellSize);
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return null;
    return { x: col, y: row };
  }, [cellSize, gridSize, canvasPixelSize]);

  // Draw with mirror
  const drawMirrored = useCallback((x: number, y: number, color: string) => {
    const points = getMirroredPoints(x, y, mirrorMode, gridSize);
    for (const [px, py] of points) {
      if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
        setPixel(px, py, color);
      }
    }
  }, [mirrorMode, gridSize, setPixel]);

  const drawPixelsMirrored = useCallback((coords: [number, number][], color: string) => {
    const allPoints: [number, number][] = [];
    for (const [x, y] of coords) {
      const mirrored = getMirroredPoints(x, y, mirrorMode, gridSize);
      allPoints.push(...mirrored);
    }
    // Deduplicate
    const seen = new Set<string>();
    const unique: [number, number][] = [];
    for (const [x, y] of allPoints) {
      const k = `${x},${y}`;
      if (!seen.has(k) && x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        seen.add(k);
        unique.push([x, y]);
      }
    }
    setPixels(unique, color);
  }, [mirrorMode, gridSize, setPixels]);

  // Preview render for shape tools
  const previewPixels = useRef<[number, number][]>([]);

  const renderPreview = useCallback(() => {
    render();
    const canvas = canvasRef.current;
    if (!canvas || previewPixels.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = currentColor;
    for (const [x, y] of previewPixels.current) {
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [render, currentColor, cellSize, gridSize]);

  // Pointer handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, e as unknown as PointerEvent);

    // Two finger pinch zoom
    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      const dx = pointers[0].clientX - pointers[1].clientX;
      const dy = pointers[0].clientY - pointers[1].clientY;
      initialPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      initialZoom.current = zoom;
      return;
    }

    if (pointersRef.current.size > 1) return;

    const cell = getCell(e);
    if (!cell) return;

    isDrawing.current = true;
    startPoint.current = cell;
    lastPoint.current = cell;
    previewPixels.current = [];

    if (currentTool === 'pen') {
      pushHistory();
      drawMirrored(cell.x, cell.y, currentColor);
    } else if (currentTool === 'eraser') {
      pushHistory();
      drawMirrored(cell.x, cell.y, '');
    } else if (currentTool === 'fill') {
      pushHistory();
      floodFill(cell.x, cell.y, currentColor);
      isDrawing.current = false;
    } else if (currentTool === 'picker') {
      const layer = currentFrame?.layers.find(l => l.id === activeLayerId);
      if (layer) {
        const idx = cell.y * gridSize + cell.x;
        const color = layer.pixels[idx];
        if (color) {
          setColor(color);
          setTool('pen');
        }
      }
      isDrawing.current = false;
    } else if (currentTool === 'spray') {
      pushHistory();
      const points = getSprayPixels(cell.x, cell.y, 3, sprayDensity, gridSize);
      drawPixelsMirrored(points, currentColor);
    } else if (currentTool === 'line' || currentTool === 'rect' || currentTool === 'circle') {
      pushHistory();
    }
  }, [getCell, currentTool, currentColor, drawMirrored, drawPixelsMirrored, floodFill, setColor, setTool, pushHistory, sprayDensity, gridSize, activeLayerId, currentFrame, zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    pointersRef.current.set(e.pointerId, e as unknown as PointerEvent);

    // Pinch zoom with two fingers
    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      const dx = pointers[0].clientX - pointers[1].clientX;
      const dy = pointers[0].clientY - pointers[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (initialPinchDist.current > 0) {
        const newZoom = initialZoom.current * (dist / initialPinchDist.current);
        setZoom(newZoom);
      }
      return;
    }

    if (!isDrawing.current || pointersRef.current.size > 1) return;

    const cell = getCell(e);
    if (!cell) return;

    if (currentTool === 'pen') {
      if (lastPoint.current && (lastPoint.current.x !== cell.x || lastPoint.current.y !== cell.y)) {
        const line = getBresenhamLine(lastPoint.current.x, lastPoint.current.y, cell.x, cell.y);
        drawPixelsMirrored(line, currentColor);
        lastPoint.current = cell;
      }
    } else if (currentTool === 'eraser') {
      if (lastPoint.current && (lastPoint.current.x !== cell.x || lastPoint.current.y !== cell.y)) {
        const line = getBresenhamLine(lastPoint.current.x, lastPoint.current.y, cell.x, cell.y);
        drawPixelsMirrored(line, '');
        lastPoint.current = cell;
      }
    } else if (currentTool === 'spray') {
      if (lastPoint.current && (lastPoint.current.x !== cell.x || lastPoint.current.y !== cell.y)) {
        const points = getSprayPixels(cell.x, cell.y, 3, sprayDensity, gridSize);
        drawPixelsMirrored(points, currentColor);
        lastPoint.current = cell;
      }
    } else if (currentTool === 'line' && startPoint.current) {
      previewPixels.current = getBresenhamLine(startPoint.current.x, startPoint.current.y, cell.x, cell.y);
      renderPreview();
    } else if (currentTool === 'rect' && startPoint.current) {
      previewPixels.current = getRectPixels(startPoint.current.x, startPoint.current.y, cell.x, cell.y, rectFill);
      renderPreview();
    } else if (currentTool === 'circle' && startPoint.current) {
      const radius = Math.round(Math.sqrt((cell.x - startPoint.current.x) ** 2 + (cell.y - startPoint.current.y) ** 2));
      previewPixels.current = getCirclePixels(startPoint.current.x, startPoint.current.y, radius, circleFill);
      renderPreview();
    }
  }, [getCell, currentTool, currentColor, drawPixelsMirrored, renderPreview, sprayDensity, gridSize, rectFill, circleFill, setZoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size === 0) {
      initialPinchDist.current = 0;
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    const cell = getCell(e);
    if (!cell || !startPoint.current) {
      previewPixels.current = [];
      render();
      return;
    }

    if (currentTool === 'line') {
      const line = getBresenhamLine(startPoint.current.x, startPoint.current.y, cell.x, cell.y);
      drawPixelsMirrored(line, currentColor);
    } else if (currentTool === 'rect') {
      const rect = getRectPixels(startPoint.current.x, startPoint.current.y, cell.x, cell.y, rectFill);
      drawPixelsMirrored(rect, currentColor);
    } else if (currentTool === 'circle') {
      const radius = Math.round(Math.sqrt((cell.x - startPoint.current.x) ** 2 + (cell.y - startPoint.current.y) ** 2));
      const circle = getCirclePixels(startPoint.current.x, startPoint.current.y, radius, circleFill);
      drawPixelsMirrored(circle, currentColor);
    }

    previewPixels.current = [];
    startPoint.current = null;
    lastPoint.current = null;
  }, [getCell, currentTool, currentColor, drawPixelsMirrored, render, rectFill, circleFill]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(zoom * delta);
    }
  }, [zoom, setZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useStore.getState().redo();
        } else {
          undo();
        }
      }
      if (e.key === 'b') setTool('pen');
      if (e.key === 'e') setTool('eraser');
      if (e.key === 'g') setTool('fill');
      if (e.key === 'l') setTool('line');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'c') setTool('circle');
      if (e.key === 'i') setTool('picker');
      if (e.key === 'm') setTool('mirror');
      if (e.key === 's') setTool('spray');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, undo]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center overflow-hidden select-none"
      style={{ width, height }}
      onWheel={handleWheel}
    >
      <div
        className="relative"
        style={{
          width: canvasPixelSize,
          height: canvasPixelSize,
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          className="rounded-xl"
          style={{
            width: canvasPixelSize,
            height: canvasPixelSize,
            cursor: currentTool === 'picker' ? 'crosshair' : 'crosshair',
            touchAction: 'none',
            imageRendering: 'pixelated',
            boxShadow: '0 0 0 2px #2a2940, 0 8px 32px rgba(0,0,0,.5)',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
