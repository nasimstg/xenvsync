import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Use Cases - xenvsync Docs",
  description:
    "How xenvsync fits into real workflows: solo developer local setup, startup team secret sharing, enterprise CI/CD pipelines, open-source maintainer credential isolation, and Docker/container workflows.",
  openGraph: {
    title: "Use Cases - xenvsync",
    description: "Real-world xenvsync workflows by team size and delivery model.",
    url: "https://xenvsync.softexforge.io/docs/use-cases",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/use-cases" },
};

export default function DocsUseCasesPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Use Cases"
        description="How teams and individuals use xenvsync across local development, CI/CD pipelines, team collaboration, and production promotion workflows."
      />

      <Section title="Solo Developer">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Keep secrets out of Git history without cloud tooling or complicated setup.</p>
          <p>A solo developer initializes a key once, encrypts their .env, and uses <code>xenvsync run</code> to start their app without plaintext ever hitting disk again. The vault is committed to Git — the key stays local.</p>
        </Card>
        <CodeBlock language="bash" title="Solo developer baseline">
{`# One-time setup
$ xenvsync init

# Encrypt your .env into a vault
$ xenvsync push
$ git add .env.vault && git commit -m "add encrypted vault"

# Start the app with secrets injected in-memory
$ xenvsync run -- npm start

# On a new machine: restore secrets from vault
$ xenvsync pull`}
        </CodeBlock>
      </Section>

      <Section title="Startup Team — Shared Encrypted Environments">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Share staging and production secrets across the team without a central vault service or a single shared password.</p>
          <p>Each developer generates their own X25519 keypair. The maintainer adds public keys to the roster and pushes a V2 vault where each member has their own encrypted key slot. No one shares a symmetric key — each person decrypts with their private identity.</p>
        </Card>
        <CodeBlock language="bash" title="Team onboarding and push">
{`# Each team member runs once on their machine
$ xenvsync keygen
$ xenvsync whoami   # copy this public key and send to maintainer

# Maintainer: build the roster
$ xenvsync team add alice <alice-pubkey>
$ xenvsync team add bob <bob-pubkey>
$ xenvsync team list

# Push — automatically uses V2 multi-key format
$ xenvsync push --env staging
$ xenvsync push --env production
$ git add .env.staging.vault .env.production.vault .xenvsync-team.json
$ git commit -m "update encrypted vaults"

# Any team member can now pull
$ xenvsync pull --env staging`}
        </CodeBlock>
        <Callout type="info">
          When a team member leaves, run <code>xenvsync rotate --revoke &lt;name&gt;</code> immediately to exclude them from future vault encryption.
        </Callout>
      </Section>

      <Section title="CI/CD Pipeline — Runtime Secret Injection">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Inject secrets into CI jobs without storing plaintext in environment variables, pipeline YAML, or build logs.</p>
          <p>Store only the raw key value as a CI secret. At runtime, write it to <code>.xenvsync.key</code> with correct permissions, then use <code>xenvsync run</code> or <code>xenvsync pull</code> before the build step.</p>
        </Card>
        <CodeBlock language="yaml" title="GitHub Actions example">
{`jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Inject xenvsync key
        run: |
          echo "\${{ secrets.XENVSYNC_KEY }}" > .xenvsync.key
          chmod 600 .xenvsync.key

      - name: Build with secrets
        run: xenvsync run -- npm run build

      - name: Audit vault integrity
        run: |
          xenvsync doctor
          xenvsync verify`}
        </CodeBlock>
        <CodeBlock language="yaml" title="GitLab CI example">
{`build:
  script:
    - echo "$XENVSYNC_KEY" > .xenvsync.key && chmod 600 .xenvsync.key
    - xenvsync run -- npm run build`}
        </CodeBlock>
      </Section>

      <Section title="Enterprise Platform Team — Auditability & Rotation">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Standardize secret handling across many services with audit trails, automatic permission checks, and access revocation workflows.</p>
          <p>Platform teams run <code>xenvsync doctor</code> and <code>xenvsync verify</code> as CI gates. The <code>log</code> command provides a Git-native audit trail of every vault change with key-level diffs. Rotation after offboarding is enforced as a policy.</p>
        </Card>
        <CodeBlock language="bash" title="Enterprise audit and rotation flow">
{`# Add vault health checks to all pipelines
$ xenvsync doctor    # permissions, gitignore, key strength
$ xenvsync verify    # structural + GCM integrity + staleness

# Review vault change history
$ xenvsync log --env production
$ xenvsync log -n 50 --env staging

# Diff current .env against encrypted vault
$ xenvsync diff --env production

# Revoke departing team member and rotate
$ xenvsync rotate --revoke former-member --env production
$ xenvsync rotate --revoke former-member --env staging
$ xenvsync push --env production
$ xenvsync push --env staging`}
        </CodeBlock>
      </Section>

      <Section title="Open Source Maintainer — Release Credentials">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Keep release signing keys, npm tokens, and deployment credentials encrypted in the repo without exposing them to contributors or forks.</p>
          <p>Use a named <code>ci</code> environment for release credentials that contributors never see. The release pipeline injects the key at runtime. Contributor builds use a different environment with limited secrets.</p>
        </Card>
        <CodeBlock language="bash" title="Release credential isolation">
{`# Separate environments for contributors vs. releases
$ xenvsync push --env dev       # general dev secrets, shared with team
$ xenvsync push --env ci        # release credentials, maintainer only

# CI release job
$ echo "$RELEASE_XENVSYNC_KEY" > .xenvsync.key && chmod 600 .xenvsync.key
$ xenvsync run --env ci -- make release

# Contributors run normally
$ xenvsync pull --env dev
$ xenvsync run --env dev -- make test`}
        </CodeBlock>
      </Section>

      <Section title="Docker & Container Workflows">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--color-text)]">Goal:</strong> Inject secrets into containers at startup without baking them into the image or using cloud secret managers.</p>
          <p>Mount the key as a Docker secret or environment variable. Use <code>xenvsync run</code> as the container entrypoint so secrets are injected into the app process in-memory and never written to the container filesystem.</p>
        </Card>
        <CodeBlock language="bash" title="Docker runtime injection">
{`# Build image without secrets
$ docker build -t myapp .

# Run with key mounted
$ docker run \
    -v \$(pwd)/.xenvsync.key:/app/.xenvsync.key:ro \
    -v \$(pwd)/.env.vault:/app/.env.vault:ro \
    myapp \
    xenvsync run -- node server.js

# Or inject key via environment + passphrase
$ docker run \
    -e XENVSYNC_KEY="\$(cat .xenvsync.key)" \
    -e XENVSYNC_PASSPHRASE="secret" \
    myapp`}
        </CodeBlock>
      </Section>

      <Section title="When to Choose xenvsync">
        <StaggerList>
          <div className="space-y-2">
            {[
              "You want encrypted vaults in Git with no always-on cloud dependency.",
              "Your team needs per-member key access without sharing one global secret.",
              "You prefer a single CLI that works identically in local and CI flows.",
              "You need in-memory secret injection so plaintext never hits disk.",
              "You want Git-native audit trails via xenvsync log.",
              "You need to support multiple named environments (staging, production, ci) from one repo.",
              "You want simple commands with a predictable, understandable security model.",
            ].map((item, i) => (
              <StaggerItem key={i}>
                <Card className="flex gap-3 items-start text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="text-[var(--color-accent)] shrink-0 font-bold">✓</span>
                  <span>{item}</span>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </Section>

      <Section title="More Resources">
        <div className="flex flex-wrap gap-2">
          <Link href="/docs/getting-started" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Getting Started
          </Link>
          <Link href="/docs/commands" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Command Reference
          </Link>
          <Link href="/docs/ci-cd" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            CI/CD Recipes
          </Link>
          <Link href="/docs/security" className="px-3 py-1.5 rounded-md text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors">
            Security Model
          </Link>
        </div>
      </Section>
    </div>
  );
}
