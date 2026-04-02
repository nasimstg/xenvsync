import { Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Contact - xenvsync",
  description:
    "Contact and support page for xenvsync: bug reports, feature requests, security disclosures, sponsorship, and collaboration.",
  openGraph: {
    title: "Contact - xenvsync",
    description: "Reach xenvsync maintainers through the right channel for support and security.",
    url: "https://xenvsync.softexforge.io/contact",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/contact" },
};

const supportChannels = [
  {
    title: "Bug reports",
    description: "Use GitHub Issues for reproducible bugs and regressions.",
    href: "https://github.com/nasimstg/xenvsync/issues",
    label: "Open an issue",
  },
  {
    title: "Feature ideas",
    description: "Use GitHub Discussions for roadmap ideas and design discussion.",
    href: "https://github.com/nasimstg/xenvsync/discussions",
    label: "Start a discussion",
  },
  {
    title: "Security vulnerabilities",
    description: "Report security issues privately through GitHub Security Advisories.",
    href: "https://github.com/nasimstg/xenvsync/security/advisories/new",
    label: "Report privately",
  },
  {
    title: "Partnerships and support",
    description: "For business support, sponsorship, and collaboration requests.",
    href: "mailto:contact@nasimstg.dev",
    label: "contact@nasimstg.dev",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Contact"
        description="Choose the right channel for bug reports, feature requests, security disclosures, and project support."
      />

      <Section title="Support Channels">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportChannels.map((channel) => (
            <Card key={channel.title} className="space-y-2">
              <h2 className="text-base font-semibold">{channel.title}</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {channel.description}
              </p>
              <a
                href={channel.href}
                target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={channel.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                {channel.label}
              </a>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Before You Open an Issue">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>To speed up triage, include:</p>
          <p>1. Exact command run and full error output.</p>
          <p>2. OS, shell, and xenvsync version.</p>
          <p>3. Output from doctor and verify when relevant.</p>
          <p>4. Minimal reproduction steps.</p>
        </Card>
      </Section>

      <Section title="Project Governance">
        <Card className="space-y-3 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            Contribution process and expectations are documented in{" "}
            <Link href="/docs/contributing" className="text-[var(--color-accent)] hover:underline">
              Contributing
            </Link>
            .
          </p>
          <p>
            Community behavior standards follow the Contributor Covenant in the project Code of Conduct.
          </p>
          <p>
            Legal usage terms are available on the{" "}
            <Link href="/terms" className="text-[var(--color-accent)] hover:underline">
              Terms
            </Link>
            {" "}and{" "}
            <Link href="/license" className="text-[var(--color-accent)] hover:underline">
              License
            </Link>
            {" "}pages.
          </p>
        </Card>
      </Section>
    </div>
  );
}
