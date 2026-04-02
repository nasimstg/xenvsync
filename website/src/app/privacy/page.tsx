import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "Privacy Policy - xenvsync",
  description:
    "Privacy policy for the xenvsync website. Explains what data is collected, how it is used, what is stored in your browser, and how to contact us with privacy questions.",
  openGraph: {
    title: "Privacy Policy - xenvsync",
    description: "How the xenvsync website handles visitor data and preferences.",
    url: "https://xenvsync.softexforge.io/privacy",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/privacy" },
};

const lastUpdated = "April 1, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Privacy Policy"
        description={`Last updated: ${lastUpdated}`}
      />

      <Section title="Overview">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            The xenvsync website (<strong>xenvsync.softexforge.io</strong>) is a documentation and project site. We are committed to keeping this policy simple and honest. This page describes what data is handled, how it is used, and what choices you have.
          </p>
          <p>
            The xenvsync <em>software itself</em> is a local CLI tool. It makes no network calls, collects no telemetry, and stores nothing outside your local filesystem. This policy covers only the website.
          </p>
        </Card>
      </Section>

      <Section title="Data We Collect">
        <div className="space-y-3">
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">Infrastructure Request Logs</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Like any website, our hosting infrastructure may log basic request data — IP address, browser user agent, referring URL, and page accessed. These logs are used for security monitoring and reliability purposes and are retained for a limited period (typically 30–90 days depending on the infrastructure provider). We do not sell or share this data with third parties for advertising.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">No Account or Sign-In Data</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              The xenvsync website does not require registration, account creation, or sign-in for any browsing or documentation access. We do not collect email addresses, names, or payment information through this website.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">No Third-Party Analytics</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              We do not use Google Analytics, Meta Pixel, or other third-party tracking scripts on this website. There are no advertising trackers embedded in our pages.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Browser Storage">
        <div className="space-y-3">
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">Consent Preference</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              When you interact with the consent banner, your choice is stored in browser <code>localStorage</code> under the key <code>xenvsync-consent-v1</code>. This is a single boolean value that prevents the banner from re-appearing on subsequent visits. It does not identify you or leave your browser.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">Theme Preference</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              If the site stores a display preference (light/dark mode), it is saved in <code>localStorage</code> on your device only. No preference data is transmitted to our servers.
            </p>
          </Card>
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">Clearing Browser Storage</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              You can clear all locally stored preferences at any time through your browser settings (Settings → Privacy → Clear browsing data → Cached images and files / Local storage). Alternatively, open the browser console and run:
            </p>
            <code className="text-xs block mt-1 p-2 rounded bg-[var(--color-bg-elevated)] font-mono">
              localStorage.removeItem(&quot;xenvsync-consent-v1&quot;)
            </code>
          </Card>
        </div>
      </Section>

      <Section title="Third-Party Services">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>The xenvsync website links to the following external services. Visiting those links is subject to their respective privacy policies:</p>
          <ul className="space-y-1 ml-3 mt-1">
            {[
              { name: "GitHub (github.com/nasimstg/xenvsync)", note: "Source code, issues, releases, discussions" },
              { name: "npm (npmjs.com)", note: "Package distribution for @nasimstg/xenvsync" },
              { name: "GitHub Sponsors", note: "Optional sponsorship — GitHub's privacy policy applies" },
            ].map(({ name, note }) => (
              <li key={name} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span><strong>{name}</strong> — {note}</span>
              </li>
            ))}
          </ul>
          <p>We do not share any personally identifiable information with these services on your behalf through the website itself.</p>
        </Card>
      </Section>

      <Section title="Children's Privacy">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          The xenvsync website is a technical documentation site intended for developers. We do not knowingly collect information from children under 13. If you believe a child has submitted personal information through this site, please contact us.
        </Card>
      </Section>

      <Section title="Changes to This Policy">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          We may update this policy as the website evolves. The &quot;Last updated&quot; date at the top of this page will reflect any changes. We will not make material changes without updating that date.
        </Card>
      </Section>

      <Section title="Contact">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          For privacy questions or concerns, email{" "}
          <a href="mailto:contact@nasimstg.dev" className="text-[var(--color-accent)] hover:underline">
            contact@nasimstg.dev
          </a>. We aim to respond within 5 business days.
        </Card>
      </Section>
    </div>
  );
}
