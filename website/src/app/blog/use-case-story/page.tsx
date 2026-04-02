import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "How a 7-Person Startup Encrypted Their Secrets in One Sprint",
  description:
    "A real migration case study: how a 7-person startup moved from plaintext .env files shared over Slack to xenvsync encrypted vaults with per-member X25519 keys, working CI/CD, and a revocation workflow — in under a week.",
  openGraph: {
    title: "How a 7-Person Startup Encrypted Their Secrets in One Sprint",
    description: "From Slack-shared .env files to encrypted team vaults in one sprint. A xenvsync migration case study.",
    url: "https://xenvsync.softexforge.io/blog/use-case-story",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/blog/use-case-story" },
};

export default function UseCaseStoryPost() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="How a 7-Person Startup Encrypted Their Secrets in One Sprint"
        description="Published March 30, 2026 · 7 min read · Case Study"
      />

      <Section title="The Starting Point">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            Picture a typical seed-stage startup: seven engineers, three environments (dev, staging, production), and a secrets strategy that could generously be described as &quot;ad hoc.&quot; The staging database password lived in a Slack DM from six months ago. The production API keys were in a Google Doc that three people had bookmarked. Two developers had slightly different local <code>.env</code> files and nobody was quite sure which one was correct.
          </p>
          <p>
            A contractor who had left two months earlier still theoretically had access to everything they had ever been messaged. Nobody had rotated the keys because nobody knew which keys they had.
          </p>
          <p>
            This is not unusual. Most early-stage teams prioritize shipping over secret hygiene, and that is a reasonable tradeoff — until it isn&apos;t.
          </p>
        </Card>
      </Section>

      <Section title="The Trigger">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            A senior engineer noticed that <code>.env</code> files were appearing in branches that contributors had pushed to forks. No secrets were exposed publicly — all the repos were private — but the close call was enough. The team decided to fix the problem properly before their Series A audit.
          </p>
          <p>
            Requirements they agreed on:
          </p>
          <ul className="mt-2 space-y-1 ml-3">
            {[
              "Secrets must be encrypted before they touch version control.",
              "Each developer should use their own key — no shared team password.",
              "CI/CD must work without passing secrets through environment variable UI.",
              "When someone leaves, their access must be revocable in under five minutes.",
              "The solution cannot require a cloud account or subscription.",
            ].map((req, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Day 1: Initialize and Encrypt">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            The lead engineer installed xenvsync via npm and ran the first encryption on the staging environment. Total time from reading the docs to a committed vault: eleven minutes.
          </p>
        </Card>
        <CodeBlock language="bash" title="Day 1 — first vault">
{`# Install
$ npm install -g @nasimstg/xenvsync

# Initialize key for the project
$ xenvsync init
# Generated .xenvsync.key
# Updated .gitignore: added .xenvsync.key, .env

# Encrypt staging secrets
$ xenvsync push --env staging
# Encrypted .env.staging → .env.staging.vault

$ git add .env.staging.vault
$ git commit -m "add encrypted staging vault"`}
        </CodeBlock>
        <Callout type="info">
          The <code>.xenvsync.key</code> was shared with the rest of the team over a secure channel (1Password) as a temporary measure. The team planned to move to per-member X25519 keys on Day 3.
        </Callout>
      </Section>

      <Section title="Day 2: Wire CI to Pull at Runtime">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            The team stored the staging key value in GitHub Actions Secrets and updated the pipeline to inject it at runtime. The plaintext environment variable blocks in the YAML were removed.
          </p>
        </Card>
        <CodeBlock language="yaml" title="GitHub Actions — runtime key injection">
{`jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up xenvsync key
        run: |
          echo "\${{ secrets.XENVSYNC_STAGING_KEY }}" > .xenvsync.key
          chmod 600 .xenvsync.key

      - name: Run tests with secrets
        run: xenvsync run --env staging -- npm test

      - name: Verify vault integrity
        run: xenvsync verify --env staging`}
        </CodeBlock>
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          One developer noted that removing the explicit <code>env:</code> block from the pipeline YAML was the most satisfying part of the day. The pipeline went from 14 environment variables to two: the key and the passphrase.
        </Card>
      </Section>

      <Section title="Day 3: Per-Member Keys and the V2 Vault">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            Each of the seven developers ran <code>xenvsync keygen</code> on their own machine and shared their public key with the lead. The lead added all seven to the team roster and re-pushed the vault. From that point on, everyone used their own identity to decrypt — the shared key from Day 1 was deleted and the locks changed.
          </p>
        </Card>
        <CodeBlock language="bash" title="Day 3 — V2 team vault">
{`# Each developer (once on their machine)
$ xenvsync keygen
$ xenvsync whoami
# Public key: ABC123...  ← share this

# Lead engineer builds roster
$ xenvsync team add alice   <alice-pubkey>
$ xenvsync team add bob     <bob-pubkey>
$ xenvsync team add carol   <carol-pubkey>
$ xenvsync team add dave    <dave-pubkey>
$ xenvsync team add eve     <eve-pubkey>
$ xenvsync team add frank   <frank-pubkey>
$ xenvsync team add grace   <grace-pubkey>

# Re-push as V2 vault — each member gets their own encrypted slot
$ xenvsync push --env staging
$ xenvsync push --env production
$ git add .env.staging.vault .env.production.vault .xenvsync-team.json
$ git commit -m "migrate to V2 per-member vaults"

# Immediately delete the shared symmetric key
$ rm .xenvsync.key`}
        </CodeBlock>
      </Section>

      <Section title="Week 2: Standardize Across All Services">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            The team spent the second week rolling the same pattern out to their other three services. Each repo got its own vault. The shared V1 key for CI was replaced with the lead&apos;s own identity key injected from GitHub Secrets (since CI acts as a &quot;robot team member&quot; in their roster model).
          </p>
          <p>
            They also set up the pre-commit hook from <code>examples/hooks/pre-commit</code> to prevent plaintext <code>.env</code> files from being staged accidentally — the problem that had triggered the whole migration.
          </p>
        </Card>
        <CodeBlock language="bash" title="Pre-commit hook setup">
{`$ cp examples/hooks/pre-commit .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit

# Hook now blocks:
# - Staging of plaintext .env files
# - Commits when vault is older than .env`}
        </CodeBlock>
      </Section>

      <Section title="The Offboarding Test">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            Three weeks after the migration, a contractor finished their engagement. The lead tested the revocation flow in a staging environment first:
          </p>
        </Card>
        <CodeBlock language="bash" title="Offboarding — revoke and rotate">
{`# Revoke contractor access across all environments
$ xenvsync rotate --revoke contractor --env staging
$ xenvsync rotate --revoke contractor --env production

# Confirm they are no longer in the roster
$ xenvsync team list

# Push updated vaults
$ xenvsync push --env staging
$ xenvsync push --env production`}
        </CodeBlock>
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Total time: four minutes and twenty seconds. The contractor&apos;s previous local identity files were worthless against the re-encrypted vaults.
        </Card>
      </Section>

      <Section title="Three Months Later">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            The team ran the migration past their Series A security audit. The auditor flagged the use of AES-256-GCM with fresh nonces, Git-committed encrypted vaults, per-member key isolation, and a documented rotation workflow as positives. The pre-existing shared-key approach was noted as resolved.
          </p>
          <p>
            Developer feedback after three months was uniformly positive. The daily workflow — <code>git pull</code>, <code>xenvsync pull</code>, <code>xenvsync run -- npm start</code> — became muscle memory within a week. The pre-commit hook caught two accidental staging attempts in the first month, both from developers who had forgotten to push their vault after editing <code>.env</code>.
          </p>
        </Card>
        <Callout type="info">
          Want to run the same migration? See the{" "}
          <Link href="/blog/migration-playbook" className="text-[var(--color-accent)] hover:underline">Migration Playbook</Link>
          {" "}for a phased guide with rollback options.
        </Callout>
      </Section>
    </article>
  );
}
