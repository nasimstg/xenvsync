import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "The Secret-Safe Developer Workflow: Local to CI Without Leaks",
  description:
    "A complete developer workflow for keeping .env secrets out of Git history, build logs, and container images — from laptop initialization through production CI/CD using xenvsync push, pull, run, and verify.",
  openGraph: {
    title: "The Secret-Safe Developer Workflow: Local to CI Without Leaks",
    description: "A repeatable four-phase pattern for secret-safe development with xenvsync.",
    url: "https://xenvsync.softexforge.io/blog/developer-workflow",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/blog/developer-workflow" },
};

export default function DeveloperWorkflowPost() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="The Secret-Safe Developer Workflow: Local to CI Without Leaks"
        description="Published March 29, 2026 · 9 min read · Developer Workflow"
      />

      <Section title="The Problem With How Most Teams Handle Secrets">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            A 2025 GitHub analysis found that over 10 million secrets were accidentally committed to public repositories in a single year. The vast majority came from developers who copy-pasted a <code>.env</code> file into the wrong place, forgot a <code>.gitignore</code> rule, or pushed a branch without realizing it contained credentials.
          </p>
          <p>
            The solution is not more careful developers — it is a workflow that makes the insecure path harder than the secure one. When the default action is &quot;encrypt first,&quot; accidental exposure becomes structurally unlikely.
          </p>
          <p>
            This post describes a four-phase workflow using xenvsync that makes the secure path the easy path, from your first <code>git init</code> through production deployment.
          </p>
        </Card>
      </Section>

      <Section title="Phase 1: Local Setup">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            Start every new project — or retrofit an existing one — with two commands. <code>xenvsync init</code> generates a 256-bit cryptographically random key and writes it with 0600 permissions. It also updates <code>.gitignore</code> to exclude both the key and your plaintext <code>.env</code>.
          </p>
        </Card>
        <CodeBlock language="bash" title="Phase 1 — project initialization">
{`# Install once per machine
$ npm install -g @nasimstg/xenvsync
# or: brew install nasimstg/tap/xenvsync
# or: go install github.com/nasimstg/xenvsync@latest

# Initialize the project
$ xenvsync init
# ✓ Generated .xenvsync.key (256-bit, mode 0600)
# ✓ Added .xenvsync.key to .gitignore
# ✓ Added .env to .gitignore

# Create your .env file normally
$ cat .env
DATABASE_URL=postgres://localhost:5432/myapp
API_SECRET=dev-secret-key
REDIS_URL=redis://localhost:6379

# Encrypt it
$ xenvsync push
# ✓ Encrypted .env → .env.vault

# Commit the vault (never the plaintext)
$ git add .env.vault
$ git commit -m "add encrypted vault"`}
        </CodeBlock>
        <Callout type="important">
          The <code>.xenvsync.key</code> file is your decryption material. Back it up somewhere secure (password manager, secrets store) before relying on the vault. If the key is lost, the vault cannot be decrypted.
        </Callout>
      </Section>

      <Section title="Phase 2: Daily Development Loop">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            The daily loop is simple: edit secrets in <code>.env</code> as needed, push to update the vault, and use <code>xenvsync run</code> to start your app. The key insight is that <code>xenvsync run</code> decrypts the vault in memory and injects the variables directly into the child process — plaintext never reaches the filesystem.
          </p>
        </Card>
        <CodeBlock language="bash" title="Phase 2 — daily workflow">
{`# Pull latest vault from repo
$ git pull
$ xenvsync pull     # restores .env from vault

# Edit secrets as needed
$ vim .env

# Re-encrypt after changes
$ xenvsync push
$ git add .env.vault && git commit -m "update secrets"

# Start app — secrets live only in process memory
$ xenvsync run -- npm start
$ xenvsync run -- python manage.py runserver
$ xenvsync run -- go run ./cmd/server

# Check what changed since last push
$ xenvsync diff

# See full sync state
$ xenvsync status`}
        </CodeBlock>
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            <strong className="text-[var(--color-text)]">Pro tip:</strong> Add the pre-commit hook from <code>examples/hooks/pre-commit</code> to your repo. It blocks commits when the vault is stale or when a plaintext <code>.env</code> file is staged. This turns security into an automatic guard rail rather than a remembered step.
          </p>
        </Card>
        <CodeBlock language="bash" title="Install pre-commit hook">
{`$ cp examples/hooks/pre-commit .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit`}
        </CodeBlock>
      </Section>

      <Section title="Phase 3: CI/CD Integration">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            CI jobs need secrets but should never store them in pipeline YAML, environment variable UI, or build artifacts. The pattern: store the raw key value as a CI secret, write it to a file at runtime, use <code>xenvsync run</code> to inject secrets in-memory.
          </p>
        </Card>
        <CodeBlock language="yaml" title="GitHub Actions — full workflow">
{`name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Inject xenvsync key
        run: |
          echo "\${{ secrets.XENVSYNC_KEY }}" > .xenvsync.key
          chmod 600 .xenvsync.key

      - name: Audit vault integrity
        run: |
          xenvsync doctor
          xenvsync verify

      - name: Run tests with secrets
        run: xenvsync run -- npm test

      - name: Build
        run: xenvsync run -- npm run build`}
        </CodeBlock>
        <CodeBlock language="yaml" title="GitLab CI — minimal">
{`test:
  script:
    - echo "$XENVSYNC_KEY" > .xenvsync.key && chmod 600 .xenvsync.key
    - xenvsync doctor && xenvsync verify
    - xenvsync run -- npm test`}
        </CodeBlock>
        <CodeBlock language="yaml" title="CircleCI">
{`jobs:
  build:
    steps:
      - checkout
      - run:
          name: Inject secrets
          command: |
            echo "$XENVSYNC_KEY" > .xenvsync.key
            chmod 600 .xenvsync.key
      - run: xenvsync run -- npm test`}
        </CodeBlock>
      </Section>

      <Section title="Phase 4: Multiple Environments and Production">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            For projects with separate staging and production configurations, use named environments. Each gets its own vault file and its own key (or its own team roster slot for V2 vaults). The <code>--env</code> flag is consistent across all commands.
          </p>
        </Card>
        <CodeBlock language="bash" title="Phase 4 — named environments">
{`# Push separate vaults per environment
$ xenvsync push --env staging
$ xenvsync push --env production

# Named vault files created:
# .env.staging.vault
# .env.production.vault

# Discover all environments
$ xenvsync envs

# Pull a specific environment
$ xenvsync pull --env staging

# Run against a specific environment
$ xenvsync run --env production -- node server.js

# Audit a specific environment
$ xenvsync verify --env production
$ xenvsync log --env production`}
        </CodeBlock>
        <Callout type="info">
          Use environment fallback merging to share common variables: put shared values in <code>.env.shared</code>, environment-specific overrides in <code>.env.staging</code>, and local machine overrides in <code>.env.local</code>. xenvsync merges all three when you push.
        </Callout>
      </Section>

      <Section title="The Complete Secure Workflow">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-4">Phase</th>
                <th className="py-2 pr-4">Command</th>
                <th className="py-2">What it does</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                ["Setup", "xenvsync init", "Generate key, update .gitignore"],
                ["Encrypt", "xenvsync push", "Encrypt .env → .env.vault"],
                ["Run locally", "xenvsync run -- <cmd>", "Inject secrets in-memory"],
                ["Restore", "xenvsync pull", "Decrypt vault → .env"],
                ["Audit", "xenvsync doctor + verify", "Check health and integrity"],
                ["Diff", "xenvsync diff", "Preview changes before push"],
                ["History", "xenvsync log", "Key-level change history"],
                ["Rotate", "xenvsync rotate", "Cycle key material"],
              ].map(([phase, cmd, desc], i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 pr-4 font-medium text-[var(--color-text)]">{phase}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-accent)]">{cmd}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/docs/commands" className="text-sm text-[var(--color-accent)] hover:underline">→ Full command reference</Link>
          <Link href="/docs/ci-cd" className="text-sm text-[var(--color-accent)] hover:underline ml-4">→ CI/CD recipes</Link>
        </div>
      </Section>
    </article>
  );
}
