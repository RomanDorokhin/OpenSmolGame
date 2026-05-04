import { RefObject } from "react";

interface GamePreviewProps {
  iframeRef: RefObject<HTMLIFrameElement | null>;
}

export default function GamePreview({ iframeRef }: GamePreviewProps) {
  return (
    <div className="ide-preview flex-1">
      <iframe
        ref={iframeRef}
        className="ide-preview-iframe w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-popups"
        title="Game Preview"
      />
    </div>
  );
}
