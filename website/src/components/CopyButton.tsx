"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const clean = text
      .split("\n")
      .filter((l) => !l.startsWith("#") && !l.startsWith("//"))
      .map((l) => l.replace(/^\$ /, ""))
      .join("\n")
      .trim();
    await navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all hover:text-[var(--color-text)] hover:border-[var(--color-border-bright)]"
      aria-label="Copy code"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="w-3.5 h-3.5 text-[var(--color-green)]" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
