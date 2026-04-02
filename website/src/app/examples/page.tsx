import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "Examples - xenvsync",
  description:
    "Real xenvsync examples across solo, startup, and enterprise teams with end-to-end command playbooks.",
  openGraph: {
    title: "Examples - xenvsync",
    description: "Team-based xenvsync examples with practical command flows.",
    url: "https://xenvsync.softexforge.io/examples",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/examples" },
};

const teamExamples = [
  {
    team: "Solo Developer",
    scale: "1-2 engineers",
    primaryGoal: "Prevent accidental plaintext leaks without adding process overhead.",
    painPoint: "Local .env is edited constantly and can be committed by mistake.",
    flow: `$ xenvsync init
$ xenvsync push
$ git add .env.vault
$ git commit -m "vault update"
$ xenvsync run -- npm run dev`,
  },
  {
    team: "Startup Team",
    scale: "3-15 engineers",
    primaryGoal: "Share staging and production secrets with per-member access and quick onboarding.",
    painPoint: "Team members share credentials over chat and CI environments drift from local setups.",
    flow: `$ xenvsync keygen
$ xenvsync whoami
$ xenvsync team add alice <alice-pubkey>
$ xenvsync team add bob <bob-pubkey>
$ xenvsync push --env staging
$ xenvsync push --env production`,
  },
  {
    team: "Enterprise Platform Team",
    scale: "15+ engineers / multiple services",
    primaryGoal: "Standardize secret controls with repeatable CI gates, audits, and revocation flow.",
    painPoint: "Inconsistent secret handling per repository and unclear offboarding confidence.",
    flow: `$ xenvsync doctor
$ xenvsync verify --env production
$ xenvsync log --env production -n 30
$ xenvsync rotate --revoke former-member --env production
$ xenvsync push --env production`,
  },
];

export default function ExamplesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <PageHeader
        title="Examples"
        description="Command-first examples for real teams. This page shows how xenvsync is applied in actual day-to-day delivery, from solo development to enterprise release controls."
      />

      <Section title="Scenario Matrix">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-4">Team</th>
                <th className="py-2 pr-4">Typical Scale</th>
                <th className="py-2">Primary Outcome</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {teamExamples.map((item) => (
                <tr key={item.team} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 pr-4 font-medium text-[var(--color-text)]">{item.team}</td>
                  <td className="py-2 pr-4">{item.scale}</td>
                  <td className="py-2">{item.primaryGoal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Team Playbooks">
        <div className="space-y-5">
          {teamExamples.map((item) => (
            <Card key={item.team} className="space-y-4">
              <h3 className="text-lg font-semibold">{item.team}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text)]">Pain point:</strong> {item.painPoint}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                <strong className="text-[var(--color-text)]">Target outcome:</strong> {item.primaryGoal}
              </p>
              <CodeBlock title={`${item.team} command flow`} language="bash">
                {item.flow}
              </CodeBlock>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Continue Exploring">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Workflow Library</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Expanded end-to-end workflows for local, CI, release, and incident scenarios.
            </p>
            <Link href="/examples/workflows" className="text-sm text-[var(--color-accent)] hover:underline">
              Open workflows
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Usage Cookbook</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Command recipes by intent: bootstrap, audit, migration, export, and recovery.
            </p>
            <Link href="/examples/usages" className="text-sm text-[var(--color-accent)] hover:underline">
              Open usages
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Narrative Use Cases</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Deeper context and tradeoff analysis across solo, startup, and enterprise teams.
            </p>
            <Link href="/use-cases" className="text-sm text-[var(--color-accent)] hover:underline">
              Open use-cases
            </Link>
          </Card>
        </div>
      </Section>
    </div>
  );
}
