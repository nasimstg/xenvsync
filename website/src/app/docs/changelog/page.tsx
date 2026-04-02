import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Changelog - xenvsync",
  description:
    "Full release history for xenvsync — security fixes, new commands, vault format changes, and upgrade guidance from v1.0.0 through v1.12.0.",
  openGraph: {
    title: "Changelog - xenvsync",
    description: "Release history and upgrade guidance for xenvsync.",
    url: "https://xenvsync.softexforge.io/docs/changelog",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/changelog" },
};

const releases = [
  {
    version: "v1.12.0",
    date: "2026-04-01",
    tag: "Latest",
    tagColor: "text-emerald-400",
    sections: [
      {
        label: "Security",
        color: "text-red-400",
        items: [
          "Fix shell injection in export --format=shell — switched from Go %q (allows $() expansion) to single-quote escaping",
          "Fix path traversal via --env flag — validate environment names contain no slashes or ..",
          "Fix V2 vault separator collision — data separator now searched after header, not globally",
        ],
      },
      {
        label: "Fixed",
        color: "text-yellow-400",
        items: [
          "Fix rotate writing key before vault — vault is now written first so old key still works on failure",
          "Fix doctor falsely failing on passphrase-protected keys (enc: prefix)",
          "Fix pre-commit hook not blocking stale vaults (verify only warns on staleness)",
          "Fix Docker/CI examples using XENVSYNC_KEY env var instead of key file mount",
          "Fix GitLab CI template deleting key in before_script before script runs",
          "Fix entrypoint.sh using unsafe eval on shell export — now uses xenvsync run",
          "Fix migration guide deleting .env.vault before git add",
          "Fix YAML export missing YAML 1.1 boolean quoting (yes, no, on, off)",
        ],
      },
      {
        label: "Improved",
        color: "text-blue-400",
        items: [
          "Website: responsive prev/next navigation (stacks on mobile)",
          "Website: sidebar FAB hidden when drawer is open",
          "Website: single-column footer on small screens",
          "Website: smoother hero text scaling across breakpoints",
          "Website: prefers-reduced-motion support for all animations",
          "Website: breadcrumb truncation on narrow screens",
          "Website: roadmap updated to show all 12 phases complete",
        ],
      },
    ],
  },
  {
    version: "v1.11.0",
    date: "2026-04-01",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "Migration guides from dotenv-vault, sops, and git-crypt (#18)",
          "Feature comparison table on migration docs page",
          "Migration page in sidebar navigation and search index",
        ],
      },
    ],
  },
  {
    version: "v1.10.0",
    date: "2026-04-01",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "Homebrew tap: brew install nasimstg/tap/xenvsync (auto-published by GoReleaser) (#17)",
          "Scoop bucket: scoop install xenvsync for Windows (auto-published by GoReleaser)",
          "Nix flake: nix run github:nasimstg/xenvsync",
          "AUR PKGBUILD for Arch Linux",
        ],
      },
    ],
  },
  {
    version: "v1.9.0",
    date: "2026-04-01",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync doctor command — audit local setup for security issues (permissions, gitignore, key strength, vault integrity, identity) (#14)",
          "Passphrase protection for key files with init --passphrase and XENVSYNC_PASSPHRASE env var (scrypt + AES-256-GCM key-encryption-key)",
          "Memory zeroing for key material after use (crypto.ZeroBytes)",
        ],
      },
    ],
  },
  {
    version: "v1.8.0",
    date: "2026-04-01",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync verify command — validate vault integrity with structural checks, GCM authentication, duplicate key detection, and stale vault warnings (#13)",
          "Pre-commit hook script (examples/hooks/pre-commit) that blocks commits when vault is stale or .env is staged",
          "--env flag support on verify for named environments",
          "Duplicate key detection warns about repeated keys in .env files",
        ],
      },
    ],
  },
  {
    version: "v1.7.0",
    date: "2026-04-01",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync log command — display vault change history from Git commits with key-level diffs (#12)",
          "--show-values flag on diff and log for explicit opt-in to display secret values",
          "-n/--limit flag on log to control how many commits are shown (default 10)",
          "Shared diff engine (diffutil.go) with computeKeyChanges and formatKeyChanges",
          "decryptVaultBytes helper for decrypting vault data from non-file sources",
        ],
      },
      {
        label: "Changed",
        color: "text-orange-400",
        items: [
          "diff now hides values by default — only key names and change types are shown",
          "diff output includes a summary line with counts of added/modified/removed keys",
        ],
      },
    ],
  },
  {
    version: "v1.6.0",
    date: "2026-03-30",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync rotate command — rotate encryption key and re-encrypt the vault in one atomic step (#11)",
          "V1 mode: generates new symmetric key and re-encrypts with it",
          "V2 mode: re-encrypts for all current roster members with fresh ephemeral keys",
          "--revoke <name> flag to remove a team member and rotate in one step",
          "--env flag support for rotating named environment vaults",
        ],
      },
    ],
  },
  {
    version: "v1.5.0",
    date: "2026-03-30",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "Docker integration: Alpine Dockerfile, multi-stage app example, docker-compose, and entrypoint script (#8)",
          "CI provider templates: GitHub Actions, GitLab CI, CircleCI, and Bitbucket Pipelines (#10)",
          "All examples in examples/docker/ and examples/ci/",
        ],
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-03-30",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync team add/remove/list commands — manage team members' X25519 public keys (#5)",
          "Team roster stored in .xenvsync-team.json (project-local, committed to repo)",
          "V2 vault format with per-member key slots using X25519 ECDH (#6)",
          "Each team member can decrypt vaults using their own private key",
          "Automatic V2 encryption when a team roster exists",
          "V1 vault backward compatibility — existing vaults remain readable",
          "Shared decryptVault() helper auto-detects V1/V2 format across all commands",
        ],
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "2026-03-30",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync keygen command — generate an X25519 keypair and store identity at ~/.xenvsync/identity (#4)",
          "xenvsync whoami command — display your public key and identity path",
          "--force flag on keygen to overwrite existing identity",
          "internal/crypto package with X25519 key generation, encoding, and decoding",
          "Cross-platform identity support (Linux, macOS, Windows)",
        ],
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "2026-03-30",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "Multi-environment support with --env flag on push, pull, run, diff, status, and export commands (#1)",
          "xenvsync envs command — discover and list all environments with sync status (#3)",
          "XENVSYNC_ENV environment variable as fallback for --env flag",
          "Named environment file convention: .env.<name> / .env.<name>.vault",
          "Environment fallback merging: .env.shared < .env.<name> < .env.local (#2)",
          "--no-fallback flag on push to disable merging for strict isolation",
          "npm README for package page on npmjs.com",
        ],
      },
    ],
  },
  {
    version: "v1.1.1",
    date: "2026-03-30",
    sections: [
      {
        label: "Fixed",
        color: "text-yellow-400",
        items: [
          "npm postinstall failing with ENOENT — tar extraction used --strip-components=1 but GoReleaser archives have no wrapper directory",
        ],
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "2026-03-29",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "xenvsync export command — decrypt vault and output as JSON, YAML, shell, tfvars, or dotenv to stdout (#9)",
          "xenvsync completion command — generate shell completions for bash, zsh, fish, and powershell (#15)",
        ],
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "2026-03-21",
    tag: "Initial Release",
    tagColor: "text-[var(--color-accent)]",
    sections: [
      {
        label: "Added",
        color: "text-green-400",
        items: [
          "AES-256-GCM encryption/decryption of .env files",
          "xenvsync init — generate encryption key with 0600 permissions",
          "xenvsync push — encrypt .env → .env.vault",
          "xenvsync pull — decrypt .env.vault → .env",
          "xenvsync run — inject secrets into child process (in-memory only)",
          "xenvsync diff — preview changes between .env and vault",
          "xenvsync status — show sync state of xenvsync files",
          "Cross-platform builds via GoReleaser (Linux, macOS, Windows)",
          "npm package wrapper for npm install -g @nasimstg/xenvsync",
          "CI pipeline with test matrix, linting, and automated releases",
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Changelog"
        description="Full release history for xenvsync — every version from initial release to latest, with security notices, new features, and breaking changes."
      />

      <Section title="Upgrade Workflow">
        <CodeBlock language="bash" title="Safe upgrade checklist">
{`# 1. Check current version
$ xenvsync version

# 2. Audit your local setup
$ xenvsync doctor

# 3. Verify vault integrity
$ xenvsync verify

# 4. Optionally rotate keys when revoking member access or after security events
$ xenvsync rotate`}
        </CodeBlock>
        <Callout type="important">
          Always review security-tagged entries before upgrading production pipelines. Pay close attention to vault format or encryption changes.
        </Callout>
        <div className="flex flex-wrap gap-2 mt-3">
          <a
            href="https://github.com/nasimstg/xenvsync/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
          >
            GitHub Releases
          </a>
          <Link
            href="/docs/installation"
            className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
          >
            Installation Guide
          </Link>
          <Link
            href="/docs/migration"
            className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
          >
            Migration Guides
          </Link>
        </div>
      </Section>

      <Section title="Release History">
        <StaggerList>
          <div className="space-y-6">
            {releases.map((release) => (
              <StaggerItem key={release.version}>
                <Card className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] pb-3">
                    <h3 className="text-lg font-bold font-mono">{release.version}</h3>
                    {release.tag && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-current ${release.tagColor}`}>
                        {release.tag}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-text-muted)] ml-auto">{release.date}</span>
                  </div>
                  <div className="space-y-3">
                    {release.sections.map((section) => (
                      <div key={section.label}>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${section.color}`}>
                          {section.label}
                        </p>
                        <ul className="space-y-1">
                          {section.items.map((item, i) => (
                            <li key={i} className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex gap-2">
                              <span className="text-[var(--color-text-muted)] mt-0.5 shrink-0">–</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </Section>
    </div>
  );
}
