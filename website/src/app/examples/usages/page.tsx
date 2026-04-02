import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Usage Examples - xenvsync",
  description:
    "Command cookbook examples for xenvsync across solo development, startup collaboration, and enterprise operations.",
  openGraph: {
    title: "Usage Examples - xenvsync",
    description: "Task-focused xenvsync command recipes by team type and operational intent.",
    url: "https://xenvsync.softexforge.io/examples/usages",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/examples/usages" },
};

const commandIntents = [
  {
    intent: "Bootstrap a secure project",
    commands: "xenvsync init + xenvsync push",
    team: "Solo / Startup",
  },
  {
    intent: "Run app without plaintext on disk",
    commands: "xenvsync run -- <cmd>",
    team: "All",
  },
  {
    intent: "Team key onboarding",
    commands: "xenvsync keygen + whoami + team add",
    team: "Startup / Enterprise",
  },
  {
    intent: "Pipeline safety gate",
    commands: "xenvsync doctor + verify",
    team: "Enterprise",
  },
  {
    intent: "Access revocation",
    commands: "xenvsync rotate --revoke",
    team: "Startup / Enterprise",
  },
];

export default function UsagesExamplesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Usage Examples"
        description="A command cookbook organized by outcomes and team maturity, from first setup to audit and recovery operations."
      />

      <Section title="Command Intent Map">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-4">Intent</th>
                <th className="py-2 pr-4">Primary commands</th>
                <th className="py-2">Best fit team</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {commandIntents.map((row) => (
                <tr key={row.intent} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 pr-4 font-medium text-[var(--color-text)]">{row.intent}</td>
                  <td className="py-2 pr-4">{row.commands}</td>
                  <td className="py-2">{row.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Solo: Build Fast, Stay Safe">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Encrypt local env, catch drift early, and run app in-memory with no plaintext file writes.
          </p>
          <CodeBlock title="Solo recipe" language="bash">
{`$ xenvsync init
$ xenvsync push
$ xenvsync diff
$ xenvsync run -- go run ./cmd/api
$ xenvsync status`}
          </CodeBlock>
        </Card>
      </Section>

      <Section title="Startup: Team Collaboration + CI">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Onboard member keys, keep CI keys runtime-only, and align staging workflows across local and pipeline runs.
          </p>
          <CodeBlock title="Startup recipe" language="bash">
{`$ xenvsync keygen && xenvsync whoami
$ xenvsync team add alice <alice-pubkey>
$ xenvsync team add bob <bob-pubkey>
$ xenvsync push --env staging
$ xenvsync run --env staging -- npm test`}
          </CodeBlock>
        </Card>
      </Section>

      <Section title="Enterprise: Governance + Incident Response">
        <Card className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Enforce health gates, export for infra pipelines, and run revocation rotation when offboarding or exposure is suspected.
          </p>
          <CodeBlock title="Enterprise recipe" language="bash">
{`$ xenvsync doctor --env production
$ xenvsync verify --env production
$ xenvsync export --env production --format=tfvars > secrets.auto.tfvars
$ terraform apply
$ xenvsync rotate --revoke former-member --env production
$ xenvsync push --env production`}
          </CodeBlock>
        </Card>
      </Section>

      <Section title="More Detailed Paths">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Use-Case Deep Dive</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Narrative paths across team maturity and responsibility boundaries.
            </p>
            <Link href="/use-cases" className="text-sm text-[var(--color-accent)] hover:underline">
              Open use-cases
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Workflow Playbooks</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Complete pipelines for onboarding, promotion, and rotation.
            </p>
            <Link href="/examples/workflows" className="text-sm text-[var(--color-accent)] hover:underline">
              Open workflows
            </Link>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-base font-semibold">Command Reference</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Full command and flag semantics for deeper customization.
            </p>
            <Link href="/docs/commands" className="text-sm text-[var(--color-accent)] hover:underline">
              Open commands
            </Link>
          </Card>
        </div>
      </Section>
    </div>
  );
}
