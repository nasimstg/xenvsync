"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface TerminalLine {
  type: "command" | "output" | "blank";
  text: string;
  delay?: number;
}

const lines: TerminalLine[] = [
  { type: "command", text: "xenvsync init", delay: 800 },
  { type: "output", text: "Generated encryption key → .xenvsync.key (mode 0600)" },
  { type: "output", text: "Updated .gitignore (added .xenvsync.key, .env)" },
  { type: "blank", text: "" },
  { type: "command", text: "xenvsync push", delay: 600 },
  { type: "output", text: "Encrypted 3 variable(s) → .env.vault" },
  { type: "blank", text: "" },
  { type: "command", text: "xenvsync run -- npm start", delay: 800 },
  { type: "output", text: "Secrets injected in-memory. Server running on :3000" },
];

export function Terminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let currentLine = 0;

    const showNext = () => {
      if (currentLine >= lines.length) return;

      const line = lines[currentLine];
      if (line.type === "command") {
        setIsTyping(true);
        setTypingIndex(0);

        let charIdx = 0;
        const typeInterval = setInterval(() => {
          charIdx++;
          setTypingIndex(charIdx);
          if (charIdx >= line.text.length) {
            clearInterval(typeInterval);
            setIsTyping(false);
            currentLine++;
            setVisibleLines(currentLine);
            setTimeout(showNext, 200);
          }
        }, 35);
      } else {
        currentLine++;
        setVisibleLines(currentLine);
        setTimeout(showNext, line.type === "blank" ? 300 : 80);
      }
    };

    setTimeout(showNext, 1000);
  }, []);

  const currentCommand = lines[visibleLines];
  const isCurrentlyTyping = isTyping && currentCommand?.type === "command";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden glow-md"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
        <span className="w-3 h-3 rounded-full bg-[var(--color-red)]/60" />
        <span className="w-3 h-3 rounded-full bg-[var(--color-yellow)]/60" />
        <span className="w-3 h-3 rounded-full bg-[var(--color-green)]/60" />
        <span className="ml-3 text-xs text-[var(--color-text-muted)] font-mono">
          ~/my-project
        </span>
      </div>

      {/* Terminal body */}
      <div ref={containerRef} className="p-5 font-mono text-sm space-y-0.5 min-h-[280px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="leading-7">
            {line.type === "command" && (
              <span>
                <span className="token-prompt">$ </span>
                <span className="token-command">{line.text}</span>
              </span>
            )}
            {line.type === "output" && (
              <span className="token-output">{line.text}</span>
            )}
            {line.type === "blank" && <br />}
          </div>
        ))}

        {/* Currently typing line */}
        {isCurrentlyTyping && currentCommand && (
          <div className="leading-7">
            <span className="token-prompt">$ </span>
            <span className="token-command">
              {currentCommand.text.slice(0, typingIndex)}
            </span>
            <span className="cursor-blink text-[var(--color-accent)]">▋</span>
          </div>
        )}

        {/* Resting cursor */}
        {!isCurrentlyTyping && visibleLines >= lines.length && (
          <div className="leading-7">
            <span className="token-prompt">$ </span>
            <span className="cursor-blink text-[var(--color-accent)]">▋</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
