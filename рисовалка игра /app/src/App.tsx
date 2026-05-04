import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';
import Palette from '@/components/Palette';
import LayersPanel from '@/components/LayersPanel';
import Timeline from '@/components/Timeline';
import Header from '@/components/Header';
import BottomBar from '@/components/BottomBar';
import ExportModal from '@/components/ExportModal';
import SettingsModal from '@/components/SettingsModal';
import Toast from '@/components/Toast';
import GameHub from '@/components/GameHub';
import ChallengeMode from '@/components/ChallengeMode';
import PixelBattle from '@/components/PixelBattle';
import AchievementsPanel from '@/components/AchievementsPanel';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import './App.css';

function Editor() {
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const currentTool = useStore(s => s.currentTool);
  const gameMode = useStore(s => s.gameMode);
  const activeChallenge = useStore(s => s.activeChallenge);

  const TOOL_NAMES: Record<string, string> = {
    pen: 'КАРАНДАШ', eraser: 'ЛАСТИК', fill: 'ЗАЛИВКА', line: 'ЛИНИЯ',
    rect: 'ПРЯМОУГОЛЬНИК', circle: 'КРУГ', picker: 'ПИПЕТКА',
    mirror: 'ЗЕРКАЛО', spray: 'СПРЕЙ',
  };

  const updateCanvasSize = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const rect = main.getBoundingClientRect();
    setCanvasSize({
      width: rect.width - 16,
      height: rect.height - 16,
    });
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useStore.getState();
      const data = {
        name: state.projectName,
        gridSize: state.gridSize,
        frames: state.frames,
        currentFrameIndex: state.currentFrameIndex,
        activeLayerId: state.activeLayerId,
        version: 1,
      };
      localStorage.setItem('pixeldrop-autosave', JSON.stringify(data));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add "Back to Hub" button for challenge/battle modes
  const setGameMode = useStore(s => s.setGameMode);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0f0e17] text-[#fffffe] select-none">
      {/* Header */}
      <Header onExportOpen={() => setShowExport(true)} onSettingsOpen={() => setShowSettings(true)} />

      {/* Game mode indicator */}
      {gameMode === 'challenge' && activeChallenge && (
        <div className="px-4 py-1.5 bg-[#ff6b35]/10 border-b border-[#ff6b35]/20 text-center">
          <span className="text-xs font-bold text-[#ff6b35]">ЧЕЛЛЕНДЖ: {activeChallenge.title}</span>
        </div>
      )}
      {gameMode === 'battle' && (
        <div className="px-4 py-1.5 bg-[#a855f7]/10 border-b border-[#a855f7]/20 text-center">
          <span className="text-xs font-bold text-[#a855f7]">PIXEL BATTLE</span>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left toolbar - desktop */}
        <div className="hidden lg:flex flex-col border-r border-[#2a2940] bg-[#0f0e17]">
          <Toolbar />
        </div>

        {/* Center area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas area */}
          <div ref={mainRef} className="flex-1 flex items-center justify-center p-2 relative">
            <Canvas width={canvasSize.width} height={canvasSize.height} />

            {/* Mobile floating toolbar */}
            <div className="lg:hidden absolute top-2 left-2 flex flex-col gap-1">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="w-10 h-10 rounded-xl border-2 border-[#2a2940] bg-[#1a1928]/90 backdrop-blur text-[#8887a0] hover:text-[#fffffe] flex items-center justify-center transition-all shadow-lg"
              >
                {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>

            {/* Mobile menu overlay */}
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:hidden absolute top-14 left-2 bg-[#1a1928]/95 backdrop-blur-xl border border-[#2a2940] rounded-2xl p-2 shadow-2xl z-20"
              >
                <Toolbar />
              </motion.div>
            )}

            {/* Mobile layers toggle */}
            <div className="lg:hidden absolute top-2 right-2 flex flex-col gap-1">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setShowLayers(!showLayers)}
                className={`
                  w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-lg text-xs font-bold
                  ${showLayers
                    ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                    : 'border-[#2a2940] bg-[#1a1928]/90 backdrop-blur text-[#8887a0]'
                  }
                `}
              >
                L
              </motion.button>
            </div>

            {/* Layers panel */}
            <div className={`
              absolute right-2 top-14 z-10 transition-all
              ${showLayers ? 'block' : 'hidden lg:block'}
              lg:static lg:block
            `}>
              <div className="lg:h-full lg:flex lg:flex-col lg:justify-center">
                <LayersPanel />
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-[#2a2940] bg-[#0f0e17] overflow-y-auto max-h-[45vh] lg:max-h-[35vh]">
            <div className="p-2 flex flex-col gap-2">
              {/* Tool label */}
              <div className="text-center">
                <span className="text-[11px] font-bold text-[#8887a0] tracking-wider">
                  {TOOL_NAMES[currentTool] || currentTool.toUpperCase()}
                </span>
              </div>

              <Palette />
              <Timeline />
              <BottomBar onExportOpen={() => setShowExport(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Back to hub button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setGameMode('hub')}
        className="fixed top-16 left-4 z-40 px-3 h-8 rounded-lg bg-[#1a1928]/80 backdrop-blur border border-[#2a2940] text-[#8887a0] hover:text-[#fffffe] text-xs font-bold flex items-center gap-1.5 shadow-lg"
      >
        ← Хаб
      </motion.button>

      {/* Game overlays */}
      {gameMode === 'challenge' && <ChallengeMode />}
      {gameMode === 'battle' && <PixelBattle />}

      {/* Modals */}
      <ExportModal isOpen={showExport} onClose={() => setShowExport(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AchievementsPanel />
      <Toast />
    </div>
  );
}

function App() {
  const gameMode = useStore(s => s.gameMode);

  return (
    <>
      {gameMode === 'hub' ? <GameHub /> : <Editor />}
    </>
  );
}

export default App;
