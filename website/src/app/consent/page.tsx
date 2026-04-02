import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section } from "@/components/DocsComponents";
import { ConsentPreferencesManager } from "@/components/ConsentPreferencesManager";
import Link from "next/link";

export const metadata = {
  title: "Consent Preferences - xenvsync",
  description:
    "Consent and preference controls for xenvsync website storage, including essential-only and accept-all options.",
  openGraph: {
    title: "Consent Preferences - xenvsync",
    description: "Understand what website preferences are stored and manage your choices.",
    url: "https://xenvsync.softexforge.io/consent",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/consent" },
};

const lastUpdated = "April 2, 2026";

export default function ConsentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Consent Preferences"
        description={`How consent is handled on this website. Last updated: ${lastUpdated}`}
      />

      <Section title="Consent Model">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>xenvsync uses a minimal consent model focused on essential website behavior and preference memory.</p>
          <p>There is no mandatory account login for documentation access, and no project-specific ad tracking requirement.</p>
          <p>Your selected consent preference is stored locally so you are not repeatedly prompted.</p>
        </Card>
      </Section>

      <Section title="What We Store">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                <th className="py-2 pr-3">Storage key</th>
                <th className="py-2 pr-3">Purpose</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              <tr>
                <td className="py-2 pr-3">xenvsync-consent-v1</td>
                <td className="py-2 pr-3">Stores your consent choice</td>
                <td className="py-2">choice and updatedAt timestamp</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="Manage Preferences">
        <ConsentPreferencesManager />
      </Section>

      <Section title="Manual Reset (Developer Option)">
        <CodeBlock title="Browser console" language="javascript">
{`localStorage.removeItem("xenvsync-consent-v1")`}
        </CodeBlock>
      </Section>

      <Section title="Related Policies">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            See <Link href="/privacy" className="text-[var(--color-accent)] hover:underline">Privacy</Link> for broader data handling notes.
          </p>
          <p>
            See <Link href="/terms" className="text-[var(--color-accent)] hover:underline">Terms</Link> for website usage terms.
          </p>
          <p>
            Questions about consent can be sent via <Link href="/contact" className="text-[var(--color-accent)] hover:underline">Contact</Link>.
          </p>
        </Card>
      </Section>
    </div>
  );
}
