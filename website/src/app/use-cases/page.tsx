import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section, StaggerItem, StaggerList } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Use Cases - xenvsync",
  description:
    "Real-world xenvsync use cases: solo developer local secret encryption, startup team X25519 key sharing, enterprise CI/CD audit pipelines, open-source maintainer credential isolation, and Docker container injection.",
  openGraph: {
    title: "Use Cases - xenvsync",
    description: "Real-world xenvsync workflows by team size and delivery model.",
    url: "https://xenvsync.softexforge.io/use-cases",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/use-cases" },
};

const profiles = [
  {
    title: "Solo Developer",
    tag: "Local Development",
    tagColor: "text-blue-400",
    goal: "Keep secrets out of Git history without cloud tooling or complicated setup. Get from zero to encrypted in under two minutes.",
    pain: "Plaintext .env files accidentally committed to GitHub. No team, no cloud budget — just want to work safely.",
    steps: [
      "Run xenvsync init to generate a local 256-bit key.",
      "Run xenvsync push to encrypt .env → .env.vault.",
      "Commit the vault file. The key stays out of Git via .gitignore.",
      "Use xenvsync run to start the app with secrets injected in-memory.",
    ],
    code: `# First-time setup (30 seconds)
$ xenvsync init
# Generated .xenvsync.key — added to .gitignore
# Added .env to .gitignore

$ xenvsync push
# Encrypted .env → .env.vault

$ git add .env.vault
$ git commit -m "add encrypted vault"

# Start app — secrets injected in-memory, never written to disk
$ xenvsync run -- npm start

# On a new machine — restore from vault
$ xenvsync pull`,
    codeTitle: "Solo workflow",
  },
  {
    title: "Startup Team",
    tag: "Team Collaboration",
    tagColor: "text-purple-400",
    goal: "Share staging and production secrets across 3–15 developers without a central vault service, a shared password, or a cloud subscription.",
    pain: "Passing .env files over Slack or email. One person's local change silently diverging from what's in CI.",
    steps: [
      "Each developer runs xenvsync keygen to get their own X25519 identity.",
      "Share your public key (xenvsync whoami) with the maintainer.",
      "Maintainer adds all keys to the roster and pushes a V2 vault.",
      "Everyone pulls with their own private key — no secret ever shared.",
    ],
    code: `# Each developer (once per machine)
$ xenvsync keygen
$ xenvsync whoami
# Public key: base64url...  (share this with maintainer)

# Maintainer builds roster
$ xenvsync team add alice <alice-pubkey>
$ xenvsync team add bob <bob-pubkey>
$ xenvsync team add carol <carol-pubkey>
$ xenvsync team list

# Push V2 multi-key vault
$ xenvsync push --env staging
$ xenvsync push --env production
$ git add .env.staging.vault .env.production.vault .xenvsync-team.json
$ git commit -m "update encrypted vaults"

# Any team member pulls with their own identity
$ xenvsync pull --env staging`,
    codeTitle: "Team onboarding",
  },
  {
    title: "Enterprise Platform Team",
    tag: "Compliance & Auditability",
    tagColor: "text-amber-400",
    goal: "Standardize secret handling across multiple services with cryptographic audit trails, enforced permissions, automated health checks, and instant access revocation.",
    pain: "Scattered secret strategies per service. No way to audit who changed what, or to prove a departing employee's access was revoked.",
    steps: [
      "Add xenvsync doctor and verify as mandatory CI gates.",
      "Use xenvsync log to track vault change history per environment.",
      "Run xenvsync rotate --revoke <name> immediately on offboarding.",
      "Enforce XENVSYNC_KEY injection via secrets manager, never hardcoded.",
    ],
    code: `# CI quality gates (add to every pipeline)
$ xenvsync doctor    # permissions, gitignore, key strength, identity
$ xenvsync verify    # structural check, GCM auth, staleness, duplicate keys

# Audit vault change history (key names only, no values)
$ xenvsync log --env production -n 50
$ xenvsync log --env staging

# Diff current .env against encrypted vault
$ xenvsync diff --env production

# Offboarding: revoke + rotate all relevant environments
$ xenvsync rotate --revoke former-engineer --env production
$ xenvsync rotate --revoke former-engineer --env staging
$ xenvsync push --env production
$ xenvsync push --env staging`,
    codeTitle: "Enterprise audit flow",
  },
  {
    title: "Open-Source Maintainer",
    tag: "Release Credential Isolation",
    tagColor: "text-green-400",
    goal: "Keep release signing keys, npm tokens, and deployment credentials encrypted in the repo without exposing them to contributors or forks.",
    pain: "Release credentials need to be somewhere, but contributors run the same CI and shouldn't see them.",
    steps: [
      "Use separate named environments: dev for contributors, ci for releases.",
      "The ci vault key is only known to maintainers and the release CI secret.",
      "Contributors pull --env dev; release jobs inject the ci key at runtime.",
      "xenvsync run injects release credentials in-memory with no disk artifact.",
    ],
    code: `# Contributor environment (shared with team)
$ xenvsync push --env dev
$ git add .env.dev.vault

# Release-only environment (maintainer only)
$ xenvsync push --env ci
$ git add .env.ci.vault

# Contributors work normally
$ xenvsync pull --env dev
$ xenvsync run --env dev -- make test

# CI release job (key injected from repo secret)
- run: echo "$RELEASE_KEY" > .xenvsync.key && chmod 600 .xenvsync.key
- run: xenvsync run --env ci -- make release`,
    codeTitle: "Release isolation",
  },
];

const comparison = [
  { feature: "Cloud dependency", xenvsync: "None — fully local", dotenvVault: "Required for sync", sops: "Optional (KMS)" },
  { feature: "Team key model", xenvsync: "X25519 per member", dotenvVault: "Shared service key", sops: "PGP / KMS / age" },
  { feature: "In-memory run", xenvsync: "Built-in xenvsync run", dotenvVault: "Limited", sops: "No native run mode" },
  { feature: "Git-native audit", xenvsync: "xenvsync log", dotenvVault: "Service dashboard", sops: "Git history only" },
  { feature: "Setup time", xenvsync: "< 2 minutes", dotenvVault: "Service registration", sops: "Key infra required" },
  { feature: "Single binary", xenvsync: "Yes, no runtime deps", dotenvVault: "npm only", sops: "Yes" },
];

export default function UseCasesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">
      <PageHeader
        title="Use Cases"
        description="How developers, teams, and platform engineers use xenvsync to solve secret management — from a solo side project to an enterprise CI/CD pipeline with audit requirements."
      />

      <section className="space-y-8">
        <StaggerList>
          <div className="space-y-8">
            {profiles.map((profile) => (
              <StaggerItem key={profile.title}>
                <Card className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">{profile.title}</h2>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border border-current ${profile.tagColor}`}>
                      {profile.tag}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <strong className="text-[var(--color-text)]">Goal:</strong> {profile.goal}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    <strong className="text-[var(--color-text)]">Common pain:</strong> {profile.pain}
                  </p>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Workflow Steps</p>
                    <ol className="space-y-1">
                      {profile.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          <span className="text-[var(--color-accent)] font-bold shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <CodeBlock title={profile.codeTitle} language="bash">
                    {profile.code}
                  </CodeBlock>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
      </section>

      <Section title="How xenvsync Compares">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-4 font-semibold">Feature</th>
                <th className="py-2 pr-4 font-semibold text-[var(--color-accent)]">xenvsync</th>
                <th className="py-2 pr-4 font-semibold">dotenv-vault</th>
                <th className="py-2 font-semibold">sops</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {comparison.map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 pr-4 font-medium text-[var(--color-text)]">{row.feature}</td>
                  <td className="py-2 pr-4 text-[var(--color-accent)]">{row.xenvsync}</td>
                  <td className="py-2 pr-4">{row.dotenvVault}</td>
                  <td className="py-2">{row.sops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="When to Choose xenvsync">
        <StaggerList>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { check: "Local-first", detail: "No cloud account, no API calls, no subscription required." },
              { check: "Per-member key access", detail: "X25519 team vaults — each person decrypts with their own key." },
              { check: "In-memory injection", detail: "xenvsync run never writes plaintext to disk." },
              { check: "Git-native audit", detail: "xenvsync log shows key-level diffs across commits." },
              { check: "Multi-environment", detail: "Separate vaults for staging, production, ci in the same repo." },
              { check: "Single binary", detail: "No runtime deps. Works identically on Linux, macOS, and Windows." },
            ].map((item) => (
              <StaggerItem key={item.check}>
                <Card className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-accent)]">✓ {item.check}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.detail}</p>
                </Card>
              </StaggerItem>
            ))}
          </div>
        </StaggerList>
        <Callout type="info">
          Not sure if xenvsync fits your stack? Read the full{" "}
          <Link href="/blog/tool-comparison" className="text-[var(--color-accent)] hover:underline">tool comparison</Link>
          {" "}or check the{" "}
          <Link href="/docs/faq" className="text-[var(--color-accent)] hover:underline">FAQ</Link>.
        </Callout>
      </Section>

      <Section title="Ready to Start?">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/docs/getting-started"
            className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/docs/installation"
            className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
          >
            Installation Guide
          </Link>
          <Link
            href="/docs/commands"
            className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
          >
            Command Reference
          </Link>
        </div>
      </Section>
    </div>
  );
}
