import { CodeBlock } from "@/components/CodeBlock";
import { Section, PageHeader, Callout, Card } from "@/components/DocsComponents";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Getting Started - xenvsync",
  description: "Get up and running with xenvsync in under a minute. Initialize, encrypt, and inject .env secrets with a few commands.",
  openGraph: {
    title: "Getting Started - xenvsync",
    description: "Get up and running with xenvsync in under a minute.",
    url: "https://xenvsync.softexforge.io/docs/getting-started",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/getting-started" },
};

export default function GettingStarted() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Getting Started"
        description="Get up and running with xenvsync in under a minute."
      />

      <Section title="Prerequisites">
        <ul className="list-disc list-inside text-[var(--color-text-secondary)] space-y-1.5">
          <li>
            <strong className="text-[var(--color-text)]">Homebrew</strong>,{" "}
            <strong className="text-[var(--color-text)]">npm</strong>,{" "}
            <strong className="text-[var(--color-text)]">Go 1.22+</strong>, or a{" "}
            <a href="https://github.com/nasimstg/xenvsync/releases" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">
              prebuilt binary
            </a>
          </li>
        </ul>
      </Section>

      <Section title="1. Install">
        <CodeBlock title="Homebrew (macOS / Linux)" language="bash">
          {`$ brew install nasimstg/tap/xenvsync`}
        </CodeBlock>
        <CodeBlock title="npm" language="bash">
          {`$ npm install -g @nasimstg/xenvsync`}
        </CodeBlock>
        <CodeBlock title="Go" language="bash">
          {`$ go install github.com/nasimstg/xenvsync@latest`}
        </CodeBlock>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Also available via{" "}
          <Link href="/docs/installation" className="text-[var(--color-accent)] hover:underline">
            Scoop, Nix, AUR, and binary downloads
          </Link>.
        </p>
      </Section>

      <Section title="2. Initialize Your Project">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Run this in your project root. It generates a 256-bit encryption key
          and adds it to <code>.gitignore</code>.
        </p>
        <CodeBlock title="Initialize" language="bash">
{`$ xenvsync init
Generated encryption key → .xenvsync.key (mode 0600)
Updated .gitignore (added .xenvsync.key, .env)`}
        </CodeBlock>
        <Callout type="important">
          The <code>.xenvsync.key</code> file is your decryption key. Never
          commit it. For team sharing, use{" "}
          <Link href="#team-sharing" className="text-[var(--color-accent)] hover:underline">
            V2 team mode
          </Link>{" "}
          so each member uses their own X25519 keypair instead.
        </Callout>
      </Section>

      <Section title="3. Create Your .env File">
        <CodeBlock title=".env" language="env">
{`DB_HOST=localhost
DB_PORT=5432
API_KEY=sk-your-secret-key
JWT_SECRET=super-secret-jwt-token`}
        </CodeBlock>
      </Section>

      <Section title="4. Encrypt (Push)">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Encrypt your <code>.env</code> into <code>.env.vault</code> &mdash;
          this file is safe to commit.
        </p>
        <CodeBlock title="Encrypt" language="bash">
{`$ xenvsync push
Encrypted 4 variable(s) → .env.vault

$ git add .env.vault
$ git commit -m "add encrypted env"`}
        </CodeBlock>
      </Section>

      <Section title="5. Decrypt (Pull)">
        <p className="text-[var(--color-text-secondary)] mb-4">
          On another machine, after cloning and copying the key:
        </p>
        <CodeBlock title="Decrypt" language="bash">
{`$ xenvsync pull
Decrypted 4 variable(s) → .env`}
        </CodeBlock>
      </Section>

      <Section title="6. Run with Injected Secrets">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Instead of writing a <code>.env</code> file, inject secrets directly
          into a process. Plaintext only exists in the child process memory.
        </p>
        <CodeBlock title="In-memory injection" language="bash">
{`$ xenvsync run -- npm start
$ xenvsync run -- python app.py
$ xenvsync run -- docker compose up`}
        </CodeBlock>
      </Section>

      <Section title="7. Multiple Environments">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Use <code>--env</code> to manage staging, production, and other environments separately.
        </p>
        <CodeBlock title="Multi-environment" language="bash">
{`$ xenvsync push --env staging
Encrypted 3 variable(s) → .env.staging.vault

$ xenvsync pull --env production
Decrypted 5 variable(s) → .env.production

$ xenvsync run --env staging -- npm start

# List all environments
$ xenvsync envs`}
        </CodeBlock>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          Merge precedence: <code>.env.shared</code> &lt; <code>.env.staging</code> &lt; <code>.env.local</code>.
          Use <code>--no-fallback</code> to disable merging.
        </p>
      </Section>

      <Section title="8. Team Sharing (V2 Vault)">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Instead of sharing a symmetric key, each team member generates their own
          X25519 keypair. The vault is encrypted individually for each member.
        </p>
        <CodeBlock title="Set up team sharing" language="bash">
{`# Each member generates their identity (once)
$ xenvsync keygen
Your public key: dGhpcyBpcyBhIGJhc2U2NCBwdWJsaWMga2V5...

# Project lead adds members to the roster
$ xenvsync team add alice <alice-public-key>
$ xenvsync team add bob <bob-public-key>

# Push auto-detects roster → creates V2 vault
$ xenvsync push
Encrypted 4 variable(s) → .env.vault (V2, 3 recipient(s))

# Each member decrypts with their own private key
$ xenvsync pull`}
        </CodeBlock>
        <Callout type="info">
          To revoke a member and rotate keys in one step:{" "}
          <code>xenvsync rotate --revoke &lt;name&gt;</code>
        </Callout>
      </Section>

      <Section title="Typical Workflow">
        <Card>
          <pre className="text-xs sm:text-sm leading-relaxed !bg-transparent !border-0 !p-0 !m-0 text-[var(--color-text-muted)]">
{`Developer A               Git Repository            Developer B
───────────               ──────────────            ───────────
.env (plaintext)
   │
   ├── xenvsync push ──►  .env.vault (encrypted)
   │                         │
   │                      git push
   │                         │
   │                      git pull ◄─────────────┐
   │                         │                   │
   │                      .env.vault ──► xenvsync pull
   │                                             │
   │                                          .env (plaintext)
   │                                             │
   └── xenvsync run                   xenvsync run`}
          </pre>
        </Card>
      </Section>

      <Section title="Next Steps">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/docs/commands"
            className="group gradient-border p-4 flex items-center justify-between glow-sm hover:glow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium mb-0.5">Command Reference</h3>
              <p className="text-xs text-[var(--color-text-muted)]">All 18 commands, flags, and aliases</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/docs/security"
            className="group gradient-border p-4 flex items-center justify-between glow-sm hover:glow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium mb-0.5">Security Model</h3>
              <p className="text-xs text-[var(--color-text-muted)]">AES-256-GCM, X25519, passphrase protection</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/docs/migration"
            className="group gradient-border p-4 flex items-center justify-between glow-sm hover:glow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium mb-0.5">Migration Guides</h3>
              <p className="text-xs text-[var(--color-text-muted)]">From dotenv-vault, sops, or git-crypt</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/docs/installation"
            className="group gradient-border p-4 flex items-center justify-between glow-sm hover:glow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium mb-0.5">Installation</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Homebrew, Scoop, npm, Nix, AUR, binary</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
