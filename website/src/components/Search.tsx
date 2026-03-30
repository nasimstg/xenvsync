"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  FileText,
  ArrowRight,
  Command,
  Hash,
} from "lucide-react";

interface SearchEntry {
  href: string;
  title: string;
  section: string;
  heading?: string;
  keywords: string[];
  content: string;
}

const searchIndex: SearchEntry[] = [
  // Getting Started
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    section: "Docs",
    keywords: ["quick start", "setup", "prerequisites", "go", "workflow"],
    content:
      "Get up and running with xenvsync in under a minute. Prerequisites Go 1.22+ or download a prebuilt binary.",
  },
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    section: "Docs",
    heading: "Initialize Your Project",
    keywords: ["init", "key", "gitignore", "encrypt", "setup"],
    content:
      "Initialize your project with xenvsync init which generates a 256-bit encryption key and adds it to gitignore. The .xenvsync.key file is your decryption key.",
  },
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    section: "Docs",
    heading: "Encrypt & Decrypt",
    keywords: ["push", "pull", "encrypt", "decrypt", "vault", "commit"],
    content:
      "Encrypt with xenvsync push to create .env.vault safe to commit. Decrypt with xenvsync pull on another machine.",
  },
  {
    href: "/docs/getting-started",
    title: "Getting Started",
    section: "Docs",
    heading: "Run with Injected Secrets",
    keywords: ["run", "inject", "in-memory", "process", "environment"],
    content:
      "Run with injected secrets using xenvsync run to inject environment variables in-memory without writing to disk. Plaintext only exists in child process memory.",
  },

  // Installation
  {
    href: "/docs/installation",
    title: "Installation",
    section: "Docs",
    heading: "Go Install",
    keywords: ["install", "go install", "go 1.22", "gopath"],
    content:
      "Go Install recommended requires Go 1.22+. Places binary in GOPATH/bin. go install github.com/nasimstg/xenvsync@latest",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    section: "Docs",
    heading: "Binary Releases",
    keywords: ["binary", "release", "download", "linux", "macos", "windows", "deb", "rpm", "tar", "zip"],
    content:
      "Prebuilt binaries available on GitHub Releases for Linux macOS Windows. Package manager support with deb and rpm. Download tar.gz or zip from releases page.",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    section: "Docs",
    heading: "Build from Source",
    keywords: ["build", "source", "clone", "make", "ldflags"],
    content:
      "Build from source with git clone and make build which injects version commit and build date via ldflags. Use make install for direct install.",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    section: "Docs",
    heading: "Supported Platforms",
    keywords: ["platform", "arm64", "amd64", "architecture", "linux", "macos", "windows"],
    content:
      "Supported platforms include Linux macOS Windows on amd64 and arm64 architectures. Formats include tar.gz deb rpm apk and zip.",
  },

  // Commands
  {
    href: "/docs/commands#init",
    title: "Command Reference",
    section: "Docs",
    heading: "init",
    keywords: ["init", "key", "generate", "force", "gitignore", "setup"],
    content:
      "init generates a cryptographically secure 256-bit AES key saves it to .xenvsync.key with 0600 permissions and ensures key file and .env are in gitignore. Use --force flag to regenerate.",
  },
  {
    href: "/docs/commands#push",
    title: "Command Reference",
    section: "Docs",
    heading: "push / encrypt",
    keywords: ["push", "encrypt", "vault", "env", "out", "custom path"],
    content:
      "push encrypts .env to .env.vault with env and out flags for custom paths. Alias encrypt. The vault file is safe to commit to version control.",
  },
  {
    href: "/docs/commands#pull",
    title: "Command Reference",
    section: "Docs",
    heading: "pull / decrypt",
    keywords: ["pull", "decrypt", "vault", "out", "custom path"],
    content:
      "pull decrypts .env.vault to .env with vault and out flags for custom paths. Alias decrypt. Reads encrypted vault and writes plaintext variables.",
  },
  {
    href: "/docs/commands#run",
    title: "Command Reference",
    section: "Docs",
    heading: "run",
    keywords: ["run", "inject", "in-memory", "child process", "spawn", "docker", "npm"],
    content:
      "run decrypts vault in-memory and spawns child process with secrets injected into environment. Plaintext secrets never touch disk. Works with npm start, python, docker compose.",
  },
  {
    href: "/docs/commands#diff",
    title: "Command Reference",
    section: "Docs",
    heading: "diff",
    keywords: ["diff", "compare", "changed", "added", "removed"],
    content:
      "diff compares .env with vault contents showing added removed and changed variables. Shows what changed before pushing or pulling.",
  },
  {
    href: "/docs/commands#status",
    title: "Command Reference",
    section: "Docs",
    heading: "status",
    keywords: ["status", "timestamps", "permissions", "sync"],
    content:
      "status reports file presence last-modified timestamps and permissions. Warns about insecure key file permissions and suggests whether to push or pull.",
  },
  {
    href: "/docs/commands#envs",
    title: "Command Reference",
    section: "Docs",
    heading: "envs",
    keywords: ["envs", "environments", "list", "discover", "staging", "production", "multi-env"],
    content:
      "envs scans current directory for .env.* and .env.*.vault files and displays all discovered environments with sync status. Shows whether each environment is synced, not pushed, or not pulled.",
  },
  {
    href: "/docs/commands#push",
    title: "Command Reference",
    section: "Docs",
    heading: "Multi-Environment",
    keywords: ["multi-env", "env flag", "staging", "production", "named environment", "XENVSYNC_ENV"],
    content:
      "Use --env flag on push pull run diff status and export to target named environments. File paths follow .env.<name> and .env.<name>.vault convention. Set XENVSYNC_ENV environment variable as fallback.",
  },
  {
    href: "/docs/commands#export",
    title: "Command Reference",
    section: "Docs",
    heading: "export",
    keywords: ["export", "json", "yaml", "shell", "tfvars", "dotenv", "format", "stdout", "kubernetes", "terraform"],
    content:
      "export decrypts vault and outputs to stdout in specified format. Supports dotenv json yaml shell and tfvars. Use eval $(xenvsync export --format=shell) to inject into current shell. Never writes to disk.",
  },
  {
    href: "/docs/commands#completion",
    title: "Command Reference",
    section: "Docs",
    heading: "completion",
    keywords: ["completion", "bash", "zsh", "fish", "powershell", "tab", "autocomplete", "shell"],
    content:
      "completion generates shell completion scripts for bash zsh fish and powershell. Source the output in your shell profile for tab completion of commands and flags.",
  },
  {
    href: "/docs/commands#version",
    title: "Command Reference",
    section: "Docs",
    heading: "version",
    keywords: ["version", "commit", "build date", "ldflags"],
    content:
      "version prints version commit hash and build date. Build info is injected at compile time via ldflags.",
  },

  // Security
  {
    href: "/docs/security",
    title: "Security Model",
    section: "Docs",
    heading: "Encryption",
    keywords: ["aes", "256", "gcm", "encryption", "algorithm", "authenticated"],
    content:
      "Uses AES-256-GCM authenticated encryption from Go standard crypto/aes and crypto/cipher packages. No third-party cryptography libraries. 256-bit key 96-bit nonce 128-bit GCM auth tag.",
  },
  {
    href: "/docs/security",
    title: "Security Model",
    section: "Docs",
    heading: "Key Management",
    keywords: ["key", "csprng", "crypto/rand", "0600", "permissions", "generation", "storage"],
    content:
      "Key generated via crypto/rand CSPRNG from OS entropy. Stored with 0600 permissions owner read write only. Never embedded in vault output or logged. Auto-added to gitignore.",
  },
  {
    href: "/docs/security",
    title: "Security Model",
    section: "Docs",
    heading: "Nonce & Tamper Detection",
    keywords: ["nonce", "tamper", "detection", "authentication", "random", "ciphertext"],
    content:
      "Fresh 12-byte random nonce per encryption. Different ciphertext each push. GCM tamper detection rejects modified corrupted or truncated vault files. Bit-flipping attacks prevented.",
  },
  {
    href: "/docs/security",
    title: "Security Model",
    section: "Docs",
    heading: "In-Memory Injection",
    keywords: ["in-memory", "injection", "run", "process", "disk", "attack surface"],
    content:
      "In-memory injection with run command never writes plaintext to disk. Secrets passed via child process environment block. Reduces attack surface compared to .env files.",
  },
  {
    href: "/docs/security",
    title: "Security Model",
    section: "Docs",
    heading: "Threat Model",
    keywords: ["threat", "vulnerability", "leak", "git", "weak key"],
    content:
      "Threat model covers secrets committed to git key file leaks vault tampering plaintext on disk and weak encryption keys. Mitigations include gitignore permissions GCM auth and CSPRNG.",
  },

  // Roadmap
  {
    href: "/roadmap",
    title: "Roadmap",
    section: "Project",
    heading: "V2 — Planned",
    keywords: ["v2", "planned", "multi-environment", "asymmetric", "x25519", "cicd", "github action", "docker", "rotation", "audit", "plugin", "homebrew"],
    content:
      "V2 planned features include multi-environment mastery with env flag and fallbacks. Asymmetric cryptography with X25519 keypair generation. CI/CD integrations with GitHub Action Docker. Secret rotation audit logging. Shell completions plugin system Homebrew Scoop AUR Nix.",
  },
  {
    href: "/roadmap",
    title: "Roadmap",
    section: "Project",
    heading: "V1 — Complete",
    keywords: ["v1", "complete", "cobra", "testing", "goreleaser", "packaging"],
    content:
      "V1 complete with CLI scaffolding Cobra framework. Cryptography engine AES-256-GCM. File I/O parsing env parser vault format. Process execution in-memory decryption signal forwarding. 38 tests. GoReleaser GitHub Actions CI.",
  },
];

export function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex
      .map((entry) => {
        const blob = `${entry.title} ${entry.heading || ""} ${entry.keywords.join(" ")} ${entry.content}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (entry.title.toLowerCase().includes(term)) score += 10;
          if (entry.heading?.toLowerCase().includes(term)) score += 8;
          if (entry.keywords.some((k) => k.includes(term))) score += 5;
          if (blob.includes(term)) score += 1;
        }
        return { ...entry, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      const q = query.trim();
      setQuery("");
      // Append ?q= for highlighting, preserve any hash
      const [path, hash] = href.split("#");
      const url = `${path}?q=${encodeURIComponent(q)}${hash ? `#${hash}` : ""}`;
      router.push(url);
    },
    [router, query]
  );

  // Keyboard shortcut to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [results]);

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      navigate(results[selectedIdx].href);
    }
  }

  // Highlight matching text in search results
  function highlight(text: string) {
    if (!query.trim()) return text;
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const regex = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-[var(--color-accent-bright)] font-medium bg-[var(--color-accent)]/15 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  function getSnippet(entry: SearchEntry): string {
    if (!query.trim()) return entry.content.slice(0, 100) + "...";
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const lower = entry.content.toLowerCase();
    for (const term of terms) {
      const idx = lower.indexOf(term);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(entry.content.length, idx + term.length + 70);
        return (start > 0 ? "..." : "") + entry.content.slice(start, end) + (end < entry.content.length ? "..." : "");
      }
    }
    return entry.content.slice(0, 100) + "...";
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-muted)] glass-bright hover:text-[var(--color-text)] transition-colors"
      >
        <SearchIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-[90vw] max-w-xl"
            >
              <div className="glass-bright rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-[var(--color-border-bright)]">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
                  <SearchIcon className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Search documentation..."
                    className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 rounded hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[50vh] overflow-y-auto py-2">
                  {query.trim() && results.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  ) : !query.trim() ? (
                    <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                      Type to search across all documentation...
                    </div>
                  ) : (
                    <ul>
                      {results.map((entry, i) => (
                        <li key={`${entry.href}-${entry.heading || i}`}>
                          <button
                            onClick={() => navigate(entry.href)}
                            onMouseEnter={() => setSelectedIdx(i)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                              i === selectedIdx
                                ? "bg-[var(--color-accent-glow-strong)]"
                                : "hover:bg-[var(--color-bg-elevated)]"
                            }`}
                          >
                            {entry.heading ? (
                              <Hash className={`w-4 h-4 mt-0.5 shrink-0 ${i === selectedIdx ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`} />
                            ) : (
                              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${i === selectedIdx ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                {entry.heading ? (
                                  <>
                                    <span className="text-xs text-[var(--color-text-muted)]">
                                      {entry.title}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-muted)]">&rsaquo;</span>
                                    <span className={`text-sm font-medium ${i === selectedIdx ? "text-[var(--color-accent-bright)]" : ""}`}>
                                      {highlight(entry.heading)}
                                    </span>
                                  </>
                                ) : (
                                  <span className={`text-sm font-medium ${i === selectedIdx ? "text-[var(--color-accent-bright)]" : ""}`}>
                                    {highlight(entry.title)}
                                  </span>
                                )}
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                                  {entry.section}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                                {highlight(getSnippet(entry))}
                              </p>
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 mt-1 shrink-0 transition-colors ${i === selectedIdx ? "text-[var(--color-accent)]" : "text-transparent"}`} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">&uarr;</kbd>
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">&darr;</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">&crarr;</kbd>
                    open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">esc</kbd>
                    close
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
