"use client";

import { motion } from "framer-motion";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import {
  CheckCircle2,
  Sparkles,
  Layers,
  Lock,
  FileCode2,
  Cpu,
  TestTube,
  Wrench,
  Package,
  Globe,
  KeyRound,
  Container,
  ShieldCheck,
  Puzzle,
  ArrowRight,
  Github,
} from "lucide-react";
import Link from "next/link";

const v2Phases = [
  {
    icon: <Globe className="w-5 h-5" />,
    name: "Phase 8: Multi-Environment Mastery",
    description: "Manage staging, production, and local environments with a single tool.",
    items: [
      "Targeted push/pull with --env flag",
      "Environment fallbacks (.env.shared < .env.staging < .env.local)",
      "Smart run injection with XENVSYNC_ENV auto-detect",
      "xenvsync envs command to list all environments",
    ],
  },
  {
    icon: <KeyRound className="w-5 h-5" />,
    name: "Phase 9: Asymmetric Cryptography",
    description: "Zero-trust key sharing for teams — no more passing symmetric keys around.",
    items: [
      "X25519 keypair generation (xenvsync keygen)",
      "Team roster management (add/remove/list public keys)",
      "Multi-key vault encryption (per-member key slots)",
      "Backward-compatible vault format versioning",
    ],
  },
  {
    icon: <Container className="w-5 h-5" />,
    name: "Phase 10: CI/CD & DevOps Integrations",
    description: "First-class support for automated pipelines and containers.",
    items: [
      "Official GitHub Action (nasimstg/xenvsync-action@v1)",
      "Docker integration (Alpine image, entrypoint best practices)",
      "Format exporting (JSON, YAML, shell, tfvars) — stdout only",
      "CI templates for GitLab, CircleCI, Bitbucket Pipelines",
    ],
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    name: "Phase 11: Hardening & Auditing",
    description: "Enterprise-grade rotation, audit trails, and integrity verification.",
    items: [
      "Secret rotation (xenvsync rotate) with team re-encryption",
      "Audit logging (xenvsync log — Git-backed change history)",
      "Integrity verification without decryption (xenvsync verify)",
      "Memory zeroing, passphrase protection, xenvsync doctor",
    ],
  },
  {
    icon: <Puzzle className="w-5 h-5" />,
    name: "Phase 12: Ecosystem & Community",
    description: "Extensibility, package managers, and developer ergonomics.",
    items: [
      "Shell completions (bash/zsh/fish/powershell)",
      "Plugin system for custom vault backends",
      "Documentation site with migration guides",
      "Homebrew tap, Scoop bucket, AUR, Nix flake",
    ],
  },
];

const v1Phases = [
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Phase 1: Scaffolding & CLI",
    items: [
      "Go module with Cobra CLI framework",
      "Command routing (init, push, pull, run, diff, status)",
      "Structured error handling via RunE",
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    name: "Phase 2: Cryptography Engine",
    items: [
      "32-byte key generation via crypto/rand",
      "AES-256-GCM encrypt/decrypt with random nonce",
      "Key file permissions enforced at 0600",
    ],
  },
  {
    icon: <FileCode2 className="w-5 h-5" />,
    name: "Phase 3: File I/O & Parsing",
    items: [
      ".env parser (quotes, multiline, comments, export prefix)",
      "Vault format (header/base64/footer, 76-char wrapping)",
      ".gitignore auto-manipulation",
    ],
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    name: "Phase 4: Process Execution",
    items: [
      "In-memory decryption (plaintext never on disk)",
      "Cross-platform child process spawning",
      "Signal forwarding (SIGINT/SIGTERM) and exit code propagation",
    ],
  },
  {
    icon: <TestTube className="w-5 h-5" />,
    name: "Phase 5: Testing",
    items: [
      "Crypto unit tests (round-trip, bad key, tampered ciphertext)",
      "Parser unit tests (edge cases, multiline, round-trip)",
      "Vault format tests (encode/decode, CRLF, malformed input)",
      "CLI integration tests (init, push, pull end-to-end)",
    ],
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    name: "Phase 6: Hardening & UX",
    items: [
      "Multiline variable support",
      "--force flag for key regeneration",
      "diff and status commands",
      "Key permission validation on load",
    ],
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Phase 7: Packaging & Distribution",
    items: [
      "GoReleaser for cross-platform builds",
      "GitHub Actions CI (test matrix, lint, release)",
      "Installation documentation",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="mesh-gradient" style={{ width: 500, height: 500, background: "var(--color-accent)", top: -200, left: "30%" }} />
        <div className="mesh-gradient" style={{ width: 350, height: 350, background: "var(--color-purple)", top: -80, right: "15%", animationDelay: "-5s" }} />
        <div className="absolute inset-0 z-0 grid-bg opacity-30" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium glass-bright text-[var(--color-accent-bright)] mb-6">
              <Sparkles className="w-3 h-3" />
              Development Roadmap
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="gradient-text">Built &amp; shipped.</span>{" "}
            All 12 phases complete.
          </motion.h1>

          <motion.p
            className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            From single-user encryption to zero-trust team secrets management —
            xenvsync v1.12.0 delivers the complete vision across 12 phases.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Stat label="V2 Phases" value="5 / 5" accent />
            <StatDivider />
            <Stat label="V1 Phases" value="7 / 7" accent />
            <StatDivider />
            <Stat label="Tests" value="60+" />
          </motion.div>
        </div>
      </section>

      {/* ============ V2 TIMELINE (COMPLETE — TOP) ============ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl sm:text-3xl font-bold">V2 — Collaboration & Scale</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-green)]/10 text-[var(--color-green)] border border-[var(--color-green)]/30 font-medium">
              Complete
            </span>
          </div>
          <p className="text-[var(--color-text-secondary)] mb-10 max-w-2xl">
            Asymmetric cryptography, multi-environment support, CI/CD integrations,
            hardening, and an extensible ecosystem — all shipped.
          </p>
        </AnimateOnScroll>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-green)] via-[var(--color-green)]/40 to-transparent hidden sm:block" />

          <div className="space-y-8">
            {v2Phases.map((phase, i) => (
              <AnimateOnScroll key={phase.name} delay={i * 0.06}>
                <div className="flex gap-5">
                  <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-[var(--color-green)]/10 border border-[var(--color-green)]/30 items-center justify-center text-[var(--color-green)] z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="flex-1 gradient-border p-5 glow-sm hover:glow-md transition-shadow">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-[var(--color-green)]">{phase.icon}</span>
                      <h3 className="font-semibold">{phase.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-3 ml-7">
                      {phase.description}
                    </p>
                    <ul className="space-y-1.5 ml-7">
                      {phase.items.map((item, j) => (
                        <li key={j} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                          <span className="text-[var(--color-green)] mt-0.5 shrink-0">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden">
        <div className="mesh-gradient" style={{ width: 400, height: 400, background: "var(--color-accent)", bottom: -200, left: "40%", opacity: 0.2 }} />
        <div className="absolute inset-0 z-0 grid-bg opacity-20" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <AnimateOnScroll>
            <Sparkles className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              What should we build next?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-lg mx-auto">
              All 12 phases are shipped. We welcome contributions, feature requests,
              and feedback to shape what comes next.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/nasimstg/xenvsync/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold text-sm hover:brightness-110 transition glow-md"
              >
                <Github className="w-4 h-4" />
                Open an Issue
              </a>
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-bright text-sm font-medium hover:bg-[var(--color-bg-elevated)] transition"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============ DIVIDER ============ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-bright)] to-transparent" />
      </div>

      {/* ============ V1 TIMELINE (COMPLETED — BOTTOM) ============ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <AnimateOnScroll>
          <div className="flex items-center gap-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">V1 — Secure Single-User Sync</h2>
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-green)]/10 text-[var(--color-green)] border border-[var(--color-green)]/30 font-medium">
              Complete
            </span>
          </div>
        </AnimateOnScroll>

        <div className="relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-green)] via-[var(--color-green)]/40 to-transparent hidden sm:block" />

          <div className="space-y-6">
            {v1Phases.map((phase, i) => (
              <AnimateOnScroll key={phase.name} delay={i * 0.05}>
                <div className="flex gap-5">
                  <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-[var(--color-green)]/10 border border-[var(--color-green)]/30 items-center justify-center text-[var(--color-green)] z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="flex-1 gradient-border p-5 opacity-85 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-[var(--color-green)]">{phase.icon}</span>
                      <h3 className="font-semibold">{phase.name}</h3>
                    </div>
                    <ul className="space-y-1.5 ml-7">
                      {phase.items.map((item, j) => (
                        <li key={j} className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2">
                          <span className="text-[var(--color-green)] mt-0.5 shrink-0">&#10003;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center px-4">
      <div className={`text-xl font-bold ${accent ? "text-[var(--color-green)]" : "text-[var(--color-text)]"}`}>
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</div>
    </div>
  );
}

function StatDivider() {
  return <div className="w-px h-8 bg-[var(--color-border)] hidden sm:block" />;
}
