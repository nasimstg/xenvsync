import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "FAQ - xenvsync",
  description:
    "Frequently asked questions about xenvsync: security model, Git safety, team sharing, key rotation, CI/CD usage, multi-environment, passphrase protection, migration, and vault formats.",
  openGraph: {
    title: "FAQ - xenvsync",
    description: "Common xenvsync setup, security, team, and workflow questions answered.",
    url: "https://xenvsync.softexforge.io/docs/faq",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/faq" },
};

const faqs: { category: string; items: { q: string; a: string; code?: string; codeTitle?: string }[] }[] = [
  {
    category: "Security & Encryption",
    items: [
      {
        q: "What encryption does xenvsync use?",
        a: "xenvsync uses AES-256-GCM for authenticated encryption. Each push operation generates a fresh 12-byte random nonce, so identical plaintext produces different ciphertext on every encryption. The 16-byte GCM authentication tag protects against tampering — if the vault is modified, decryption will fail with an authentication error.",
      },
      {
        q: "Is .env.vault safe to commit to Git?",
        a: "Yes. The vault is the encrypted artifact and is intentionally designed for version control. The symmetric key (.xenvsync.key) or your private identity (~/.xenvsync/identity) must never be committed. xenvsync init automatically adds both .xenvsync.key and .env to .gitignore.",
      },
      {
        q: "Can xenvsync detect vault tampering?",
        a: "Yes. AES-256-GCM includes an authentication tag that covers both the ciphertext and the nonce. Any modification to the vault — even a single bit — will cause decryption to fail. Use xenvsync verify to explicitly check vault integrity without modifying any files.",
      },
      {
        q: "What does passphrase protection do?",
        a: "With xenvsync init --passphrase, the symmetric key is itself encrypted using a scrypt-derived key (N=32768, r=8, p=1) plus AES-256-GCM. This means even if .xenvsync.key is obtained, it cannot be used without the passphrase. Set XENVSYNC_PASSPHRASE in your environment before running xenvsync commands.",
        code: `$ xenvsync init --passphrase
$ export XENVSYNC_PASSPHRASE="your-passphrase"
$ xenvsync push`,
        codeTitle: "Passphrase-protected init",
      },
      {
        q: "Does xenvsync store anything in the cloud?",
        a: "No. xenvsync is completely local-first. The encrypted vault lives in your Git repository. Your decryption key lives on your local filesystem. There is no external service, API call, or network dependency at any point in the encrypt/decrypt/run workflow.",
      },
    ],
  },
  {
    category: "Team Sharing",
    items: [
      {
        q: "How does team access work without sharing one global key?",
        a: "xenvsync V2 vaults use X25519 asymmetric cryptography. Each team member generates their own keypair with xenvsync keygen. When you push with a team roster in place, xenvsync creates a per-member encrypted key slot inside the vault using the member's public key. Each member decrypts their slot with their own private key — no global shared secret is ever distributed.",
        code: `# Each member runs once on their machine
$ xenvsync keygen
$ xenvsync whoami   # prints public key to share

# Maintainer adds members and pushes
$ xenvsync team add alice <alice-public-key>
$ xenvsync team add bob <bob-public-key>
$ xenvsync push`,
        codeTitle: "Team onboarding",
      },
      {
        q: "What happens when a team member leaves?",
        a: "Remove them from the roster and rotate immediately. The rotate command re-encrypts the vault excluding the revoked member. Any vault encrypted before rotation is accessible to the removed member — rotation ensures future vaults are not.",
        code: `# Revoke and rotate in one step
$ xenvsync rotate --revoke former-member
$ xenvsync push

# Confirm new roster
$ xenvsync team list`,
        codeTitle: "Revoking access",
      },
      {
        q: "Where is the team roster stored?",
        a: "The roster is stored in .xenvsync-team.json in the project root. It is safe to commit to the repository — it contains only member names and their public keys, not any secret material. All team members should commit this file so everyone works with the same roster.",
      },
      {
        q: "Can I use xenvsync without a team roster?",
        a: "Yes. Without .xenvsync-team.json, xenvsync uses V1 format: a single symmetric key encrypts the vault. This is ideal for solo developers or projects where secret management is handled by one person. V1 and V2 vaults are automatically detected on pull.",
      },
    ],
  },
  {
    category: "Multi-Environment",
    items: [
      {
        q: "How do I use different secrets per environment?",
        a: "Use the --env flag to name your environment. xenvsync creates .env.<name> and .env.<name>.vault files. You can have as many environments as needed — staging, production, ci, preview, etc.",
        code: `$ xenvsync push --env staging
$ xenvsync push --env production
$ xenvsync pull --env staging
$ xenvsync run --env production -- node server.js`,
        codeTitle: "Named environments",
      },
      {
        q: "What is environment fallback merging?",
        a: "When you push with --env <name>, xenvsync merges three layers in order: .env.shared (base values for all environments) → .env.<name> (environment-specific overrides) → .env.local (local machine overrides, never committed). Use --no-fallback to disable this and encrypt only the named file.",
      },
      {
        q: "How do I discover which environments exist in a project?",
        a: "Run xenvsync envs. It scans for all .env.* and .env.*.vault files and shows their sync status — which have been pushed, which are stale, and which are missing vaults.",
        code: `$ xenvsync envs`,
        codeTitle: "List all environments",
      },
    ],
  },
  {
    category: "CI/CD",
    items: [
      {
        q: "How do I use xenvsync in CI without committing the key?",
        a: "Store the key value in your CI provider's secrets store. At runtime, write it to .xenvsync.key with 0600 permissions before running pull or run. The vault file is already in the repository.",
        code: `# GitHub Actions example
- name: Inject xenvsync key
  run: |
    echo "\${{ secrets.XENVSYNC_KEY }}" > .xenvsync.key
    chmod 600 .xenvsync.key

- name: Run with secrets
  run: xenvsync run -- npm run build`,
        codeTitle: "GitHub Actions",
      },
      {
        q: "Should I use xenvsync pull or xenvsync run in CI?",
        a: "Prefer xenvsync run -- <command> when possible. It injects secrets directly into the child process environment without writing plaintext to disk. Use xenvsync pull only when you need the .env file to exist on disk for tools that require it.",
      },
      {
        q: "How do I validate vault integrity as a CI quality gate?",
        a: "Add xenvsync verify and xenvsync doctor as steps before your build. verify checks structural and cryptographic integrity; doctor audits permissions, gitignore state, and key strength.",
        code: `$ xenvsync doctor
$ xenvsync verify
$ xenvsync run -- npm test`,
        codeTitle: "CI quality gate",
      },
    ],
  },
  {
    category: "Key Rotation & Audit",
    items: [
      {
        q: "How does key rotation work?",
        a: "xenvsync rotate decrypts the current vault, generates new key material, and re-encrypts in one atomic step. For V1 (single-key) mode, a new symmetric key is generated and written. For V2 (team) mode, fresh ephemeral X25519 keys are used for all current roster members. The vault is written before the key to ensure rollback safety.",
      },
      {
        q: "How do I see what changed in the vault over time?",
        a: "Use xenvsync log to view vault change history from Git commits. It shows key-level diffs (added/modified/removed key names) across the last N commits, without exposing values by default.",
        code: `# Show last 10 commits that touched the vault
$ xenvsync log

# Show more commits
$ xenvsync log -n 25

# Opt in to showing values (use with care)
$ xenvsync log --show-values`,
        codeTitle: "Vault audit log",
      },
    ],
  },
  {
    category: "Installation & Compatibility",
    items: [
      {
        q: "What operating systems does xenvsync support?",
        a: "xenvsync supports Linux (x86_64, arm64), macOS (x86_64, arm64), and Windows (x86_64, arm64). It is distributed as a single static binary with no runtime dependencies.",
      },
      {
        q: "How do I install xenvsync?",
        a: "xenvsync is available via npm, Homebrew, Scoop (Windows), AUR (Arch Linux), Nix flake, go install, and direct binary download. See the installation guide for all options.",
        code: `# npm (works on all platforms)
$ npm install -g @nasimstg/xenvsync

# Homebrew (macOS / Linux)
$ brew install nasimstg/tap/xenvsync

# Scoop (Windows)
$ scoop install xenvsync

# Go
$ go install github.com/nasimstg/xenvsync@latest`,
        codeTitle: "Install options",
      },
      {
        q: "Are V1 and V2 vaults compatible?",
        a: "Yes. xenvsync automatically detects vault format on pull, run, diff, verify, and other read commands. V1 vaults remain readable after upgrading. V2 is used automatically when a .xenvsync-team.json roster exists.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Frequently Asked Questions"
        description="Answers to common questions about xenvsync security, team sharing, multi-environment setups, CI/CD usage, key rotation, and installation."
      />

      {faqs.map((group) => (
        <Section key={group.category} title={group.category}>
          <StaggerList>
            <div className="space-y-3">
              {group.items.map((item) => (
                <StaggerItem key={item.q}>
                  <Card className="space-y-3">
                    <h3 className="text-base font-semibold">{item.q}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.a}</p>
                    {item.code && (
                      <CodeBlock title={item.codeTitle} language="bash">
                        {item.code}
                      </CodeBlock>
                    )}
                  </Card>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </Section>
      ))}

      <Section title="More Resources">
        <div className="flex flex-wrap gap-2">
          <Link href="/docs/troubleshooting" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Troubleshooting Guide
          </Link>
          <Link href="/docs/commands" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Command Reference
          </Link>
          <Link href="/docs/security" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Security Model
          </Link>
          <a href="https://github.com/nasimstg/xenvsync/discussions" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            GitHub Discussions
          </a>
        </div>
      </Section>
    </div>
  );
}
