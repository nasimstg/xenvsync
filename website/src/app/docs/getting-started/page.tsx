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
            <strong className="text-[var(--color-text)]">Go 1.22+</strong> for
            installing from source
          </li>
          <li>
            Or download a{" "}
            <a href="https://github.com/nasimstg/xenvsync/releases" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">
              prebuilt binary
            </a>
          </li>
        </ul>
      </Section>

      <Section title="1. Install">
        <CodeBlock title="Install via Go" language="bash">
          {`$ go install github.com/nasimstg/xenvsync@latest`}
        </CodeBlock>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          See{" "}
          <Link href="/docs/installation" className="text-[var(--color-accent)] hover:underline">
            Installation
          </Link>{" "}
          for all methods.
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
          commit it. Share it with teammates through a secure channel.
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
              <p className="text-xs text-[var(--color-text-muted)]">All commands, flags, and aliases</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href="/docs/security"
            className="group gradient-border p-4 flex items-center justify-between glow-sm hover:glow-md transition-shadow"
          >
            <div>
              <h3 className="font-medium mb-0.5">Security Model</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Encryption, keys, and nonces</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
