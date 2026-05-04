import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Settings, Download } from 'lucide-react';

interface HeaderProps {
  onExportOpen: () => void;
  onSettingsOpen: () => void;
}

export default function Header({ onExportOpen, onSettingsOpen }: HeaderProps) {
  const projectName = useStore(s => s.projectName);
  const setProjectName = useStore(s => s.setProjectName);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);

  const handleSubmit = () => {
    if (editValue.trim()) {
      setProjectName(editValue.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0f0e17] border-b border-[#2a2940]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h1
          className="text-xl font-black tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #ffd23f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PixelDrop
        </h1>

        {/* Project name */}
        {isEditing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            className="text-sm bg-[#1a1928] border border-[#a855f7] rounded-lg px-2 py-0.5 text-[#fffffe] outline-none w-32"
          />
        ) : (
          <span
            className="text-sm text-[#8887a0] cursor-pointer hover:text-[#fffffe] transition-colors truncate max-w-[120px]"
            onClick={() => { setEditValue(projectName); setIsEditing(true); }}
            title="Нажмите для редактирования"
          >
            {projectName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onExportOpen}
          className="w-9 h-9 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#06d6a0] hover:border-[#06d6a0] flex items-center justify-center transition-all"
          title="Экспорт"
        >
          <Download size={16} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onSettingsOpen}
          className="w-9 h-9 rounded-xl border-2 border-[#2a2940] bg-[#1a1928] text-[#8887a0] hover:text-[#fffffe] hover:border-[#3a3960] flex items-center justify-center transition-all"
          title="Настройки"
        >
          <Settings size={16} />
        </motion.button>
      </div>
    </div>
  );
}
