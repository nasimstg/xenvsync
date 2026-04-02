import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "Support xenvsync Development",
  description:
    "Support xenvsync open-source development through GitHub Sponsors, one-time contributions, or business support. Help fund maintenance, new features, documentation, and CI infrastructure.",
  openGraph: {
    title: "Support xenvsync Development",
    description: "Help sustain open-source development of xenvsync.",
    url: "https://xenvsync.softexforge.io/donate",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/donate" },
};

export default function DonatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Support xenvsync"
        description="xenvsync is free, open-source software released under the MIT license. Your support helps sustain maintenance, new features, documentation, and CI infrastructure."
      />

      <Section title="Why Support Matters">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            xenvsync is built and maintained as a solo open-source project. Every line of code, every test, every documentation page, and every release is produced without a corporate sponsor or VC backing.
          </p>
          <p>
            Sponsorship directly funds the time required to:
          </p>
          <ul className="space-y-1 ml-3 mt-1">
            {[
              "Review and merge community contributions",
              "Maintain packaging across npm, Homebrew, Scoop, AUR, and Nix",
              "Run CI pipelines across Linux, macOS, and Windows",
              "Write and update documentation",
              "Respond to security advisories promptly",
              "Develop new features requested by the community",
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Ways to Support">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-3">
            <h2 className="text-base font-semibold">GitHub Sponsors</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Become a recurring sponsor through GitHub Sponsors. Monthly sponsorships help with long-term planning and prioritizing roadmap work. Every tier directly supports development time.
            </p>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              <li className="flex gap-2"><span className="text-[var(--color-accent)]">$5/mo</span><span>– Community supporter</span></li>
              <li className="flex gap-2"><span className="text-[var(--color-accent)]">$15/mo</span><span>– Regular contributor tier</span></li>
              <li className="flex gap-2"><span className="text-[var(--color-accent)]">$50/mo</span><span>– Team supporter</span></li>
            </ul>
            <a
              href="https://github.com/sponsors/nasimstg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Sponsor on GitHub →
            </a>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-base font-semibold">Business Support</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Using xenvsync in production at your company? Priority support is available for teams that need implementation guidance, architecture review, security consultation, or custom integrations.
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Business support includes:
            </p>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              {[
                "Direct email support with SLA",
                "Migration assistance from existing tooling",
                "Security review of your xenvsync setup",
                "Custom CI/CD integration help",
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--color-accent)] shrink-0">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="mailto:contact@nasimstg.dev"
              className="inline-block px-4 py-2 rounded-md text-sm font-medium border border-[var(--color-border)] hover:border-[var(--color-accent-dim)] transition-colors"
            >
              Contact for business support →
            </a>
          </Card>
        </div>
      </Section>

      <Section title="Other Ways to Help">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              title: "Star on GitHub",
              detail: "Stars increase visibility and help more developers discover xenvsync.",
              href: "https://github.com/nasimstg/xenvsync",
              label: "Star the repo",
            },
            {
              title: "Share and Write",
              detail: "Write about your xenvsync setup, share the project with your team, or post on social media.",
              href: null,
              label: null,
            },
            {
              title: "Contribute Code",
              detail: "Bug fixes, new features, and documentation improvements are always welcome.",
              href: "https://github.com/nasimstg/xenvsync/blob/main/CONTRIBUTING.md",
              label: "Read contributing guide",
            },
          ].map(({ title, detail, href, label }) => (
            <Card key={title} className="space-y-2">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{detail}</p>
              {href && label && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  {label} →
                </a>
              )}
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Transparency">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-2">
          <p>
            xenvsync is built by{" "}
            <a href="https://www.nasimstg.dev" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
              Md Nasim Sheikh
            </a>
            {" "}at{" "}
            <a href="https://softexforge.io" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
              SoftexForge
            </a>. The project is MIT licensed and will remain free and open-source. Sponsorship supports the developer&apos;s time, not a locked-down feature tier.
          </p>
        </Card>
      </Section>
    </div>
  );
}
