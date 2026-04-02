import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "xenvsync - Encrypted Environment Variables for Teams",
  description:
    "Encrypt, commit, and inject .env secrets with AES-256-GCM. A fast, zero-dependency CLI tool for secure local development — no cloud required.",
  openGraph: {
    title: "xenvsync - Encrypted Environment Variables for Teams",
    description: "Encrypt, commit, and inject .env secrets with AES-256-GCM. No cloud required.",
    url: "https://xenvsync.softexforge.io",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io" },
};
import { CodeBlock } from "@/components/CodeBlock";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { Terminal } from "@/components/Terminal";
import { HeroInstallTabs } from "@/components/HeroInstallTabs";
import {
  Shield,
  Zap,
  GitBranch,
  Eye,
  ArrowRight,
  Github,
  Lock,
  FileKey,
  RefreshCw,
  Layers,
  Binary,
  ChevronDown,
  Users,
  RotateCcw,
  Stethoscope,
} from "lucide-react";

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Mesh gradient blobs */}
        <div className="mesh-gradient" style={{ width: 500, height: 500, background: "var(--color-accent)", top: -200, left: "20%" }} />
        <div className="mesh-gradient" style={{ width: 400, height: 400, background: "var(--color-purple)", top: -100, right: "10%", animationDelay: "-7s" }} />
        <div className="absolute inset-0 z-0 grid-bg opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-8 text-center">
          {/* Badge */}
          <AnimateOnScroll direction="none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs text-[var(--color-text-secondary)] mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
              Open source &mdash; MIT Licensed
            </div>
          </AnimateOnScroll>

          {/* Headline */}
          <AnimateOnScroll delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Encrypt your{" "}
              <span className="gradient-text">.env</span>
              <br className="hidden sm:block" />{" "}
              Commit with confidence
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <p className="mt-5 text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              A blazing-fast CLI that encrypts environment variables with{" "}
              <strong className="text-[var(--color-text)]">AES-256-GCM</strong>,
              shares them with your team via{" "}
              <strong className="text-[var(--color-text)]">X25519 key exchange</strong>,
              and injects them in-memory &mdash; no cloud service required.
            </p>
          </AnimateOnScroll>

          {/* CTAs */}
          <AnimateOnScroll delay={0.3}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/docs/getting-started"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-bright)] text-[var(--color-bg)] font-semibold text-sm hover:shadow-[0_0_24px_var(--color-accent-glow-strong)] transition-shadow"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://github.com/nasimstg/xenvsync"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-bright text-sm font-medium hover:border-[var(--color-border-bright)] transition-colors"
              >
                <Github className="w-4 h-4" />
                Star on GitHub
              </a>
            </div>
          </AnimateOnScroll>

          {/* Install one-liner */}
          <AnimateOnScroll delay={0.4}>
            <HeroInstallTabs />
          </AnimateOnScroll>

          {/* Scroll hint */}
          <div className="mt-10 text-[var(--color-text-muted)] animate-bounce">
            <ChevronDown className="w-5 h-5 mx-auto" />
          </div>
        </div>
      </section>

      {/* ============ TERMINAL DEMO ============ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <AnimateOnScroll>
          <Terminal />
        </AnimateOnScroll>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <AnimateOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-2">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Three commands. Zero cloud accounts.
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] mb-12 max-w-lg mx-auto">
            From setup to production in under 60 seconds.
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              icon: <FileKey className="w-5 h-5" />,
              title: "Initialize",
              desc: "Generate a 256-bit key. Automatically added to .gitignore.",
              cmd: "xenvsync init",
            },
            {
              step: "02",
              icon: <Lock className="w-5 h-5" />,
              title: "Encrypt & Commit",
              desc: "Encrypt your .env into .env.vault — safe to push to any repo.",
              cmd: "xenvsync push",
            },
            {
              step: "03",
              icon: <Zap className="w-5 h-5" />,
              title: "Inject & Run",
              desc: "Secrets live only in process memory. Plaintext never touches disk.",
              cmd: "xenvsync run -- npm start",
            },
          ].map((item, i) => (
            <AnimateOnScroll key={item.step} delay={i * 0.1}>
              <div className="gradient-border p-5 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-black text-[var(--color-border-bright)]">
                    {item.step}
                  </span>
                  <span className="text-[var(--color-accent)]">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
                  {item.desc}
                </p>
                <code className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-accent-bright)] font-mono">
                  {item.cmd}
                </code>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ============ BENTO FEATURES ============ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <AnimateOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-2">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Security without complexity
          </h2>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large feature card */}
          <AnimateOnScroll className="sm:col-span-2 lg:col-span-2">
            <div className="gradient-border p-6 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-glow-strong)] border border-[var(--color-accent-dim)]/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="font-semibold text-lg">AES-256-GCM + X25519 Key Exchange</h3>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Uses Go&apos;s standard <code>crypto/aes</code> with authenticated encryption.
                Every push generates a fresh random nonce, so identical plaintext always
                produces different ciphertext. Team sharing uses X25519 ECDH with per-member
                ephemeral key slots — no shared symmetric key needed.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-muted)]">
                [nonce 12B] ‖ [ciphertext] ‖ [GCM tag 16B] → base64 → .env.vault
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.1}>
            <BentoCard
              icon={<Eye className="w-5 h-5" />}
              title="In-Memory Only"
              desc="The 'run' command decrypts secrets into the child process environment. Plaintext never hits disk."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.12}>
            <BentoCard
              icon={<Users className="w-5 h-5" />}
              title="Team Sharing"
              desc="X25519 keypairs let each member decrypt with their own private key. No shared secrets to distribute."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.15}>
            <BentoCard
              icon={<Layers className="w-5 h-5" />}
              title="Multi-Environment"
              desc="Push and pull named environments — staging, production, ci. Merge .env.shared < .env.staging < .env.local."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.18}>
            <BentoCard
              icon={<RotateCcw className="w-5 h-5" />}
              title="Key Rotation & Revoke"
              desc="Rotate encryption keys and revoke team members atomically. Fresh ephemeral keys on every rotation."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <BentoCard
              icon={<Binary className="w-5 h-5" />}
              title="Single Binary"
              desc="Zero runtime dependencies. One binary for Linux, macOS, and Windows on both amd64 and arm64."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.22}>
            <BentoCard
              icon={<GitBranch className="w-5 h-5" />}
              title="Audit Log & Diff"
              desc="Track vault changes over time from Git history. Diff shows which keys changed without exposing values."
            />
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.25}>
            <BentoCard
              icon={<Stethoscope className="w-5 h-5" />}
              title="Doctor & Verify"
              desc="Audit permissions, gitignore, key strength, and vault integrity. Pre-commit hook blocks stale vaults."
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <AnimateOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-2">
            Comparison
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How it compares
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto">
            xenvsync vs existing tools for managing .env secrets
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] glow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-elevated)] text-left">
                  <th className="px-5 py-3.5 font-medium">Feature</th>
                  <th className="px-5 py-3.5 font-bold text-[var(--color-accent)]">xenvsync</th>
                  <th className="px-5 py-3.5 font-medium text-[var(--color-text-muted)]">dotenv-vault</th>
                  <th className="px-5 py-3.5 font-medium text-[var(--color-text-muted)]">git-crypt</th>
                  <th className="px-5 py-3.5 font-medium text-[var(--color-text-muted)]">sops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {[
                  ["No cloud account", true, false, true, true],
                  ["In-memory injection", true, false, false, false],
                  ["Team sharing (asymmetric)", true, false, false, true],
                  ["Multi-environment", true, true, false, false],
                  ["Key rotation & revoke", true, false, false, false],
                  ["Diff / audit log", true, false, false, true],
                  ["Single binary, zero deps", true, false, false, false],
                  ["Passphrase-protected keys", true, false, false, false],
                ].map(([feature, ...vals], i) => (
                  <tr key={i} className="hover:bg-[var(--color-bg-card)] transition-colors">
                    <td className="px-5 py-3 font-medium">{feature as string}</td>
                    {(vals as boolean[]).map((v, j) => (
                      <td key={j} className="px-5 py-3 text-center">
                        {v ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-green)]/10 text-[var(--color-green)] text-xs">&#10003;</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">&#10005;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
            <Link href="/docs/migration" className="text-[var(--color-accent)] hover:underline">
              Migration guides
            </Link>{" "}
            available for dotenv-vault, sops, and git-crypt.
          </p>
        </AnimateOnScroll>
      </section>

      {/* ============ QUICK START CODE ============ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <AnimateOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-2">
            Quick start
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
            Up and running in seconds
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <CodeBlock title="Solo workflow" language="bash">
{`# 1. Initialize — generates key + updates .gitignore
$ xenvsync init

# 2. Encrypt your .env (safe to commit)
$ xenvsync push
$ git add .env.vault && git commit -m "add encrypted env"

# 3. On another machine — decrypt the vault
$ xenvsync pull

# 4. Or inject secrets in-memory (no .env written)
$ xenvsync run -- npm start`}
          </CodeBlock>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.1}>
          <div className="mt-6">
            <CodeBlock title="Team workflow (V2 vault)" language="bash">
{`# Each member generates their identity once
$ xenvsync keygen

# Project lead adds team members
$ xenvsync team add alice <alice-public-key>
$ xenvsync team add bob <bob-public-key>

# Push auto-encrypts for all team members
$ xenvsync push    # creates V2 vault with per-member key slots

# Each member decrypts with their own private key
$ xenvsync pull    # uses ~/.xenvsync/identity`}
            </CodeBlock>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ============ FAQ ============ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <AnimateOnScroll>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] text-center mb-2">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">
            Common questions
          </h2>
        </AnimateOnScroll>

        <div className="space-y-3">
          {[
            {
              q: "How is this different from dotenv-vault?",
              a: "xenvsync works 100% offline. No cloud account, no third-party service. Your key never leaves your machine. It also supports in-memory injection, team sharing via X25519 key exchange, key rotation, and audit logging — features dotenv-vault doesn't offer.",
            },
            {
              q: "Is it safe to commit .env.vault to Git?",
              a: "Yes. The vault is encrypted with AES-256-GCM. Without the key file (.xenvsync.key) or your X25519 private key, the ciphertext is cryptographically indistinguishable from random data. The key is auto-added to .gitignore.",
            },
            {
              q: "How do I share secrets with teammates?",
              a: "Each team member runs `xenvsync keygen` to create their X25519 keypair, then shares their public key. The project lead adds members with `team add`. When you push, the vault is encrypted individually for each member — no shared symmetric key needed.",
            },
            {
              q: "What if a team member leaves?",
              a: "Run `xenvsync rotate --revoke <name>` to remove the member from the roster and re-encrypt the vault in one atomic step. They can no longer decrypt the vault, even with a copy of the old file.",
            },
            {
              q: "Does it work with Docker?",
              a: "Yes. Use `xenvsync run -- docker compose up` to inject secrets into Docker processes, or use the init-container pattern from examples/docker/. Secrets exist only in process memory, not in any file.",
            },
            {
              q: "What happens if someone tampers with the vault?",
              a: "GCM provides authenticated encryption. Any modification — even a single bit flip — causes decryption to fail. Run `xenvsync verify` to check vault integrity, or use the pre-commit hook to block stale vaults automatically.",
            },
            {
              q: "Can I protect the key file with a passphrase?",
              a: "Yes. Run `xenvsync init --passphrase` to encrypt the key file with scrypt + AES-256-GCM. Set the XENVSYNC_PASSPHRASE environment variable to decrypt it during operations.",
            },
          ].map((faq, i) => (
            <AnimateOnScroll key={i} delay={i * 0.05}>
              <details className="group gradient-border p-5">
                <summary className="flex items-center justify-between cursor-pointer font-medium list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden">
        <div className="mesh-gradient" style={{ width: 400, height: 400, background: "var(--color-accent)", bottom: 0, left: "30%", animationDelay: "-5s" }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
          <AnimateOnScroll>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-purple)] flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Ready to secure your <span className="gradient-text">.env</span>?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
              Get started in under a minute. No sign-ups, no cloud accounts,
              no configuration files.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/docs/getting-started"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-bright)] text-[var(--color-bg)] font-semibold text-sm hover:shadow-[0_0_24px_var(--color-accent-glow-strong)] transition-shadow"
              >
                Read the Docs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://github.com/nasimstg/xenvsync"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-bright text-sm font-medium hover:border-[var(--color-border-bright)] transition-colors"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}

function BentoCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="gradient-border p-5 h-full group hover:glow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-glow)] border border-[var(--color-border)] flex items-center justify-center mb-3 text-[var(--color-accent)] group-hover:border-[var(--color-accent-dim)]/50 transition-colors">
        {icon}
      </div>
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
