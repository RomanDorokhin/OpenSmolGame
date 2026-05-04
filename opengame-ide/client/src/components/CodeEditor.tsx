import { useEffect, useRef } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = code;
    }
  }, [code]);

  return (
    <div className="ide-editor relative">
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full bg-transparent text-foreground font-mono text-sm resize-none outline-none p-4 z-10"
        spellCheck="false"
        style={{
          caretColor: "#58a6ff",
          lineHeight: "1.5",
        }}
      />
      <pre className="absolute inset-0 w-full h-full bg-background text-muted-foreground font-mono text-sm p-4 pointer-events-none overflow-hidden">
        <code>{code}</code>
      </pre>
    </div>
  );
}
