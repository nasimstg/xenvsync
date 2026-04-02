import { Card, PageHeader, Section } from "@/components/DocsComponents";
import Link from "next/link";

export const metadata = {
  title: "Terms of Use - xenvsync",
  description:
    "Terms of use for the xenvsync website and documentation. Covers acceptable use, open-source license terms, disclaimer of warranties, limitation of liability, and governing law.",
  openGraph: {
    title: "Terms of Use - xenvsync",
    description: "Usage terms for the xenvsync website, documentation, and open-source project.",
    url: "https://xenvsync.softexforge.io/terms",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/terms" },
};

const lastUpdated = "April 1, 2026";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Terms of Use"
        description={`Last updated: ${lastUpdated}`}
      />

      <Section title="Acceptance">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          By accessing or using the xenvsync website (<strong>xenvsync.softexforge.io</strong>), you agree to these Terms of Use. If you do not agree, please do not use the site. These terms apply to the website and its documentation content only — the xenvsync software is governed separately by the MIT License.
        </Card>
      </Section>

      <Section title="Website Content">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            All documentation, guides, blog posts, and examples on this website are provided for informational purposes. Content reflects the state of the software at the time of writing and may become outdated as the project evolves.
          </p>
          <p>
            You are responsible for evaluating the suitability of any information or technique described here for your specific environment and requirements. Nothing on this site constitutes professional security, legal, or compliance advice.
          </p>
        </Card>
      </Section>

      <Section title="Acceptable Use">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>You agree not to use this website to:</p>
          <ul className="space-y-1 ml-3 mt-1">
            {[
              "Violate any applicable law or regulation.",
              "Attempt to gain unauthorized access to the website infrastructure.",
              "Scrape, harvest, or systematically extract content in a manner that burdens the site's servers.",
              "Distribute malware or engage in phishing using links to this domain.",
              "Misrepresent your affiliation with the xenvsync project.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)] shrink-0">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Open-Source Software License">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            The xenvsync CLI software is distributed under the <Link href="/license" className="text-[var(--color-accent)] hover:underline">MIT License</Link>. The MIT License grants you broad rights to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the software, subject to the conditions in the license text.
          </p>
          <p>
            Website content (documentation text, blog posts, design) is the property of the xenvsync contributors and is not licensed for wholesale reproduction without attribution. Code examples and command snippets shown in documentation may be freely used under the same MIT License terms as the software.
          </p>
        </Card>
      </Section>

      <Section title="Disclaimer of Warranties">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            The website and its content are provided <strong>&quot;as is&quot;</strong> without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, or non-infringement.
          </p>
          <p>
            The xenvsync software is similarly provided under the MIT License without warranty. You assume all risks associated with using the software in your environment.
          </p>
        </Card>
      </Section>

      <Section title="Limitation of Liability">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
          <p>
            To the fullest extent permitted by applicable law, the xenvsync contributors and maintainers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website or the xenvsync software, including but not limited to loss of data, loss of profits, or security incidents.
          </p>
          <p>
            This limitation applies regardless of whether such damages are based on warranty, contract, tort, or any other legal theory, even if advised of the possibility of such damages.
          </p>
        </Card>
      </Section>

      <Section title="Third-Party Links">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          This website links to external resources including GitHub, npm, and other services. We are not responsible for the content, availability, or privacy practices of any linked third-party websites. Links are provided for convenience only.
        </Card>
      </Section>

      <Section title="Governing Law">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          These terms are governed by applicable law. Any disputes relating to this website or these terms shall be resolved in accordance with applicable jurisdiction. If any provision of these terms is found unenforceable, the remaining provisions continue in full force.
        </Card>
      </Section>

      <Section title="Changes to These Terms">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          We may update these terms as the website evolves. The &quot;Last updated&quot; date at the top of this page reflects any changes. Continued use of the website after an update constitutes acceptance of the revised terms.
        </Card>
      </Section>

      <Section title="Contact">
        <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          Questions about these terms can be sent to{" "}
          <a href="mailto:contact@nasimstg.dev" className="text-[var(--color-accent)] hover:underline">
            contact@nasimstg.dev
          </a>.
        </Card>
      </Section>
    </div>
  );
}
