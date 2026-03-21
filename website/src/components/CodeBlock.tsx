"use client";

import { CopyButton } from "./CopyButton";

interface CodeBlockProps {
  children: string;
  title?: string;
  language?: string;
}

export function CodeBlock({ children, title, language }: CodeBlockProps) {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-card)]">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)] font-medium">{title}</span>
          {language && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <pre className="!rounded-none !border-0 !m-0">
          <code>{colorize(children)}</code>
        </pre>
        <CopyButton text={children} />
      </div>
    </div>
  );
}

function colorize(code: string): React.ReactNode[] {
  return code.split("\n").map((line, i) => {
    const trimmed = line.trim();
    let content: React.ReactNode;

    if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
      content = <span className="token-comment">{line}</span>;
    } else if (trimmed.startsWith("$")) {
      const parts = line.split(/^(\$\s)/);
      content = (
        <>
          <span className="token-prompt">{parts[1]}</span>
          <span className="token-command">{parts[2]}</span>
        </>
      );
    } else if (
      trimmed.startsWith("xenvsync") || trimmed.startsWith("go ") ||
      trimmed.startsWith("git ") || trimmed.startsWith("make") ||
      trimmed.startsWith("npm") || trimmed.startsWith("curl") ||
      trimmed.startsWith("brew") || trimmed.startsWith("sudo") ||
      trimmed.startsWith("tar ")
    ) {
      content = <span className="token-command">{line}</span>;
    } else if (
      trimmed.startsWith("Generated") || trimmed.startsWith("Encrypted") ||
      trimmed.startsWith("Decrypted") || trimmed.startsWith("Updated") ||
      trimmed.startsWith("→")
    ) {
      content = <span className="token-output">{line}</span>;
    } else {
      content = line;
    }

    return (
      <span key={i}>
        {content}
        {"\n"}
      </span>
    );
  });
}
