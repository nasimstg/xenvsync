import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Migration Playbook: From dotenv / git-crypt / sops to xenvsync",
  description:
    "A phased migration playbook to move from plaintext .env files, dotenv-vault, git-crypt, or sops to xenvsync. Includes inventory steps, CI transition, team key setup, rollback strategy, and a go/no-go checklist.",
  openGraph: {
    title: "Migration Playbook: From dotenv / git-crypt / sops to xenvsync",
    description: "A low-risk, phased migration guide to xenvsync with rollback options at every step.",
    url: "https://xenvsync.softexforge.io/blog/migration-playbook",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/blog/migration-playbook" },
};

export default function MigrationPlaybookPost() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Migration Playbook: From dotenv / git-crypt / sops to xenvsync"
        description="Published March 27, 2026 · 10 min read · Migration Guide"
      />

      <Section title="Before You Start">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            Migrating secret management is high-stakes work. The goal of this playbook is to make each phase independently reversible. You should be able to complete Phase 1 and stop, run both systems in parallel during Phase 2, and only cut over fully in Phase 4 once you have validated that xenvsync works end-to-end in your environment.
          </p>
          <p>
            <strong className="text-[var(--color-text)]">Estimated timeline:</strong> One sprint (one week) for most teams. The bottleneck is usually CI validation and getting all team members to generate identities — not the technical setup.
          </p>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "From plaintext .env", time: "1–2 days", note: "Fastest path — nothing to replace, just add encryption." },
            { label: "From dotenv-vault", time: "2–3 days", note: "Need to export secrets from service and re-encrypt locally." },
            { label: "From git-crypt / sops", time: "3–5 days", note: "Decrypt existing vault, re-encrypt with xenvsync, validate CI." },
          ].map(({ label, time, note }) => (
            <Card key={label} className="space-y-1">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-[var(--color-accent)] font-mono">{time}</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{note}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Phase 1: Inventory and Install">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            Before touching any secrets, understand what you have. List every <code>.env</code> file, vault artifact, and CI secret in use. This inventory becomes your test checklist in Phase 4.
          </p>
        </Card>
        <CodeBlock language="bash" title="Inventory your current state">
{`# Find all .env files in the repo (excluding node_modules)
$ find . -name ".env*" -not -path "*/node_modules/*" -not -path "*/.git/*"

# List all CI secrets (check your provider's UI or CLI)
# GitHub: gh secret list
# GitLab: glab variable list

# Note: environments in use
$ ls .env* | grep -v ".vault" | grep -v ".example"`}
        </CodeBlock>
        <CodeBlock language="bash" title="Install xenvsync">
{`# npm (all platforms)
$ npm install -g @nasimstg/xenvsync

# macOS / Linux (Homebrew)
$ brew install nasimstg/tap/xenvsync

# Windows (Scoop)
$ scoop install xenvsync

# Verify
$ xenvsync version`}
        </CodeBlock>
      </Section>

      <Section title="Phase 2: Encrypt One Non-Production Environment">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            Start with staging or dev — never production first. This lets you validate the full push/pull/run cycle with low risk. Run the old and new systems in parallel until you are confident.
          </p>
        </Card>
        <CodeBlock language="bash" title="Phase 2 — first encryption">
{`# Initialize in the project root
$ xenvsync init
# ✓ Generated .xenvsync.key (mode 0600)
# ✓ Updated .gitignore

# Encrypt the staging environment
$ xenvsync push --env staging

# Validate: decrypt and check contents
$ xenvsync pull --env staging
$ diff .env.staging .env.staging.backup   # compare to known-good

# Verify vault integrity
$ xenvsync verify --env staging
$ xenvsync doctor

# Commit the vault
$ git add .env.staging.vault
$ git commit -m "migrate: add xenvsync encrypted staging vault"`}
        </CodeBlock>
        <Callout type="important">
          Keep your old secret management running in parallel. Do not delete dotenv-vault files, git-crypt keys, or sops configs until Phase 4 validation is complete.
        </Callout>
      </Section>

      <Section title="Phase 3: Transition CI to Runtime Key Injection">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            Update one CI job to use xenvsync. Store the key value as a CI secret and write it to a file at runtime. Validate that the job passes before updating all jobs.
          </p>
        </Card>
        <CodeBlock language="yaml" title="GitHub Actions — updated job">
{`# Add XENVSYNC_STAGING_KEY to repo secrets
# Settings → Secrets → Actions → New repository secret

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # New: inject xenvsync key
      - name: Inject key
        run: |
          echo "\${{ secrets.XENVSYNC_STAGING_KEY }}" > .xenvsync.key
          chmod 600 .xenvsync.key

      # Remove: old env var injection or dotenv-vault step
      # - run: dotenv-vault pull ...

      - name: Run tests
        run: xenvsync run --env staging -- npm test`}
        </CodeBlock>
        <CodeBlock language="bash" title="GitLab CI — updated script">
{`test:
  variables:
    # Add XENVSYNC_STAGING_KEY as a masked CI/CD variable
  script:
    - echo "$XENVSYNC_STAGING_KEY" > .xenvsync.key && chmod 600 .xenvsync.key
    - xenvsync run --env staging -- npm test`}
        </CodeBlock>
      </Section>

      <Section title="Phase 3b: Set Up Team Keys (if using team sharing)">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            If you are moving away from a shared-key model, have each team member generate their X25519 identity now. Collect all public keys before re-pushing the vault.
          </p>
        </Card>
        <CodeBlock language="bash" title="Team migration to V2 vaults">
{`# Each team member (once per machine)
$ xenvsync keygen
$ xenvsync whoami   # share this output with the maintainer

# Maintainer: build roster from collected public keys
$ xenvsync team add alice   <alice-pubkey>
$ xenvsync team add bob     <bob-pubkey>
# ... add all members

# Re-push as V2 vault
$ xenvsync push --env staging
$ xenvsync push --env production
$ git add .xenvsync-team.json *.vault
$ git commit -m "migrate: switch to V2 per-member vaults"`}
        </CodeBlock>
      </Section>

      <Section title="Phase 4: Validate and Cut Over">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>Run this checklist before removing the old system:</p>
        </Card>
        <Card className="space-y-2">
          {[
            "xenvsync pull works for every team member on their machine.",
            "xenvsync run works in local dev for all services.",
            "CI passes on all pipelines using xenvsync key injection.",
            "xenvsync doctor reports no failures or security warnings.",
            "xenvsync verify passes on all vaults.",
            "All team members have generated identities and pulled successfully (for V2).",
            "Pre-commit hook installed and tested — blocks plaintext .env staging.",
          ].map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <span className="text-[var(--color-accent)] shrink-0">☐</span>
              <span>{item}</span>
            </div>
          ))}
        </Card>
        <CodeBlock language="bash" title="Final cut-over commands">
{`# Encrypt production environment
$ xenvsync push --env production

# Run full audit
$ xenvsync doctor
$ xenvsync verify --env staging
$ xenvsync verify --env production

# Commit everything
$ git add .
$ git commit -m "migrate: complete xenvsync migration across all environments"

# Now safe to remove old artifacts:
# - .env.vault (dotenv-vault format if different)
# - .git-crypt keys
# - sops .decrypted files
# - old CI secret variables`}
        </CodeBlock>
      </Section>

      <Section title="Rollback Plan">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            Because each phase is additive (you never delete the old system until Phase 4), rollback at any phase is straightforward:
          </p>
          <ul className="space-y-1 ml-3 mt-2">
            {[
              "Phase 1 rollback: Nothing changed — just delete .xenvsync.key and the vault files.",
              "Phase 2 rollback: Revert the vault commit. The old system is still functional.",
              "Phase 3 rollback: Revert the CI job change. Old secrets variables are still there.",
              "Phase 4 rollback: If you did not delete old artifacts, revert the commit and restore the old CI variables.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Callout type="info">
          xenvsync vaults are format-stable and forward-compatible. V1 and V2 vaults are both supported in all current and future xenvsync versions. You will not be locked in to a specific version after migration.
        </Callout>
      </Section>

      <Section title="Migration from Specific Tools">
        <div className="space-y-3">
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">From plaintext .env files</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Fastest path. Just run <code>xenvsync init</code> and <code>xenvsync push</code>. The <code>.gitignore</code> update happens automatically. Run Phase 2–4 in a single day.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">From dotenv-vault</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Export your decrypted secrets from the dotenv-vault service into a local <code>.env</code> file. Then run xenvsync init and push. The key difference: xenvsync never calls an external service — the vault is self-contained in your repo.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">From git-crypt</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Run <code>git-crypt unlock</code> to decrypt the repo, copy the plaintext secrets to a temporary <code>.env</code> file, then run xenvsync init and push. After validating, remove the git-crypt filter configuration from <code>.gitattributes</code>.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">From sops</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Run <code>sops --decrypt secrets.yaml</code> to extract plaintext values. Convert to <code>KEY=VALUE</code> format in a <code>.env</code> file. Then follow the standard xenvsync init and push flow. For teams already using age keys, note that X25519 key derivation in xenvsync is independent of age key format.
            </p>
          </Card>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/docs/migration" className="text-sm text-[var(--color-accent)] hover:underline">→ Full migration docs</Link>
          <Link href="/blog/tool-comparison" className="text-sm text-[var(--color-accent)] hover:underline ml-4">→ Tool comparison</Link>
        </div>
      </Section>
    </article>
  );
}
