import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "Integrations - xenvsync",
  description:
    "Integrate xenvsync with Node.js, Python, Docker Compose, Kubernetes, Terraform, and CI pipelines.",
  openGraph: {
    title: "Integrations - xenvsync",
    description: "Integration patterns for app runtimes, containers, IaC, and CI workflows.",
    url: "https://xenvsync.softexforge.io/integrations",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/integrations" },
};

export default function IntegrationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="Integrations"
        description="Practical snippets to integrate xenvsync into common engineering stacks."
      />

      <div id="nodejs" className="scroll-mt-24">
        <Section title="Node.js / Next.js">
          <CodeBlock title="In-memory inject for dev server" language="bash">
{`$ xenvsync run -- npm run dev
$ xenvsync run -- npm test`}
          </CodeBlock>
        </Section>
      </div>

      <div id="python" className="scroll-mt-24">
        <Section title="Python">
          <CodeBlock title="Inject into Python app" language="bash">
{`$ xenvsync run -- python app.py
$ xenvsync run -- pytest`}
          </CodeBlock>
        </Section>
      </div>

      <div id="docker" className="scroll-mt-24">
        <Section title="Docker Compose">
          <CodeBlock title="Compose with injected env" language="bash">
{`$ xenvsync run -- docker compose up --build`}
          </CodeBlock>
          <Card className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Prefer in-memory injection for local workflows when possible to avoid writing plaintext .env files.
          </Card>
        </Section>
      </div>

      <div id="kubernetes" className="scroll-mt-24">
        <Section title="Kubernetes">
          <CodeBlock title="Export to yaml and apply" language="bash">
{`$ xenvsync export --format=yaml > secrets.yaml
$ kubectl apply -f secrets.yaml`}
          </CodeBlock>
        </Section>
      </div>

      <div id="terraform" className="scroll-mt-24">
        <Section title="Terraform">
          <CodeBlock title="Generate tfvars" language="bash">
{`$ xenvsync export --format=tfvars > secrets.auto.tfvars
$ terraform apply`}
          </CodeBlock>
        </Section>
      </div>

      <Section title="CI/CD">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            For production pipelines, use the provider-specific recipes in{" "}
            <Link href="/docs/ci-cd" className="text-[var(--color-accent)] hover:underline">
              CI/CD Recipes
            </Link>
            .
          </p>
          <p>
            Keep decryption keys in CI secret stores and load them only at runtime for jobs that need secrets.
          </p>
        </Card>
      </Section>
    </div>
  );
}
