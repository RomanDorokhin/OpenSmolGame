import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Settings, Plus, Play, Copy, Trash2, Menu } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import CodeEditor from "@/components/CodeEditor";
import GamePreview from "@/components/GamePreview";
import ProjectSidebar from "@/components/ProjectSidebar";
import APISettingsModal from "@/components/APISettingsModal";

export default function IDE() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [gameCode, setGameCode] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const projectsQuery = trpc.projects.list.useQuery();
  const sessionsQuery = trpc.sessions.list.useQuery(
    { projectId: selectedProject || 0 },
    { enabled: !!selectedProject }
  );

  if (loading) {
    return (
      <div className="ide-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Загрузка IDE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ide-container flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">OpenGame IDE</h1>
          <p className="text-muted-foreground mb-6">Требуется авторизация</p>
          <a href="/api/oauth/login" className="btn-primary inline-block">
            Войти
          </a>
        </div>
      </div>
    );
  }

  const handleRunGame = () => {
    if (iframeRef.current && gameCode) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        try {
          doc.open();
          doc.write(gameCode);
          doc.close();
        } catch (e) {
          console.error("Error writing to iframe:", e);
        }
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
  };

  return (
    <div className="ide-container">
      {/* Header */}
      <div className="ide-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-ghost mr-4"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold flex-1">OpenGame IDE</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="btn-ghost"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="ide-main flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <ProjectSidebar
            selectedProject={selectedProject}
            selectedSession={selectedSession}
            onSelectProject={setSelectedProject}
            onSelectSession={setSelectedSession}
          />
        )}

        {/* Center: Chat + Code Editor */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Panel */}
          <div className="ide-panel w-1/3">
            <ChatPanel
            sessionId={selectedSession || undefined}
            onGameCodeExtracted={setGameCode}
          />
          </div>

          {/* Code Editor */}
          <div className="ide-panel w-1/3">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="font-semibold text-sm">Код игры</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="btn-ghost p-2"
                  title="Копировать код"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <CodeEditor code={gameCode} onChange={setGameCode} />
          </div>

          {/* Preview Panel */}
          <div className="ide-panel w-1/3">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <h3 className="font-semibold text-sm">Предпросмотр</h3>
              <button
                onClick={handleRunGame}
                className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Запустить игру
              </button>
            </div>
            <GamePreview iframeRef={iframeRef} />
          </div>
        </div>
      </div>

      {/* API Settings Modal */}
      {showSettings && (
        <APISettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
