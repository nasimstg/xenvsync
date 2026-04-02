"use client";

import { useMemo, useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type InstallTarget = {
  id: string;
  label: string;
  hint: string;
  command: string;
};

const installTargets: InstallTarget[] = [
  {
    id: "homebrew",
    label: "Homebrew",
    hint: "macOS / Linux",
    command: "$ brew install nasimstg/tap/xenvsync",
  },
  {
    id: "npm",
    label: "npm",
    hint: "Node.js",
    command: "$ npm install -g @nasimstg/xenvsync",
  },
  {
    id: "scoop",
    label: "Scoop",
    hint: "Windows",
    command: "$ scoop bucket add nasimstg https://github.com/nasimstg/scoop-bucket\n$ scoop install xenvsync",
  },
  {
    id: "go",
    label: "Go",
    hint: "Go 1.25+",
    command: "$ go install github.com/nasimstg/xenvsync@latest",
  },
];

export function HeroInstallTabs() {
  const [activeId, setActiveId] = useState(installTargets[0].id);
  const reduceMotion = useReducedMotion();

  const activeTarget = useMemo(
    () => installTargets.find((target) => target.id === activeId) ?? installTargets[0],
    [activeId]
  );

  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <div
        role="tablist"
        aria-label="Install instructions"
        className="mb-3 p-1 rounded-xl bg-[color:rgba(12,12,20,0.9)] border border-[var(--color-border-bright)] inline-flex flex-wrap justify-center gap-1"
      >
        {installTargets.map((target) => {
          const isActive = target.id === activeTarget.id;
          return (
            <button
              key={target.id}
              id={`install-tab-${target.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls="install-tab-panel"
              onClick={() => {
                if (target.id !== activeId) {
                  setActiveId(target.id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${
                isActive
                  ? "relative text-[var(--color-accent-bright)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[color:rgba(255,255,255,0.04)]"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="hero-install-active-pill"
                  className="absolute inset-0 rounded-lg bg-[color:rgba(34,211,238,0.2)]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative z-10 font-medium">{target.label}</span>
              <span className="relative z-10 ml-1 text-[10px] text-[var(--color-text-muted)]">{target.hint}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTarget.id}
          id="install-tab-panel"
          role="tabpanel"
          aria-labelledby={`install-tab-${activeTarget.id}`}
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <CodeBlock title={`${activeTarget.label} install`} language="bash">
            {activeTarget.command}
          </CodeBlock>
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-[var(--color-text-muted)] mt-2">
        Pick the installer your team already uses. Each option installs the same xenvsync CLI.
      </p>
    </div>
  );
}
