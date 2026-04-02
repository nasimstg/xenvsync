import { CodeBlock } from "@/components/CodeBlock";
import { Callout, Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "CI/CD Recipes - xenvsync",
  description:
    "Production-ready xenvsync CI/CD recipes for GitHub Actions, GitLab CI, CircleCI, and Bitbucket Pipelines.",
  openGraph: {
    title: "CI/CD Recipes - xenvsync",
    description: "Secure CI/CD patterns for decrypting and injecting secrets with xenvsync.",
    url: "https://xenvsync.softexforge.io/docs/ci-cd",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/ci-cd" },
};

export default function CiCdPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="CI/CD Recipes"
        description="Secure pipeline patterns for decrypting and injecting secrets without committing plaintext files."
      />

      <Section title="Baseline Pattern">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>1. Store the key in your CI secret manager, never in the repository.</p>
          <p>2. Install xenvsync in pipeline jobs.</p>
          <p>3. Write the key at runtime with restricted permissions.</p>
          <p>4. Run pull or run only in jobs that actually need secrets.</p>
        </Card>
        <Callout type="warning">
          Prefer environment-scoped vaults (for example, staging and production) to reduce blast radius.
        </Callout>
      </Section>

      <div id="github-actions" className="scroll-mt-24">
        <Section title="GitHub Actions">
          <CodeBlock title="Workflow snippet" language="yaml">
{`name: build
on: [push]

jobs:
  app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/install-latest-xenvsync.sh
      - run: |
          echo "$XENVSYNC_KEY" > .xenvsync.key
          chmod 600 .xenvsync.key
        env:
          XENVSYNC_KEY: \${{ secrets.XENVSYNC_KEY }}
      - run: xenvsync pull --env staging
      - run: npm ci && npm test`}
          </CodeBlock>
        </Section>
      </div>

      <div id="gitlab-ci" className="scroll-mt-24">
        <Section title="GitLab CI">
          <CodeBlock title=".gitlab-ci.yml snippet" language="yaml">
{`build:
  image: ubuntu:24.04
  script:
    - bash scripts/install-latest-xenvsync.sh
    - echo "$XENVSYNC_KEY" > .xenvsync.key
    - chmod 600 .xenvsync.key
    - xenvsync pull --env staging
    - npm ci
    - npm test`}
          </CodeBlock>
        </Section>
      </div>

      <div id="circleci" className="scroll-mt-24">
        <Section title="CircleCI">
          <CodeBlock title=".circleci/config.yml snippet" language="yaml">
{`jobs:
  build:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run: bash scripts/install-latest-xenvsync.sh
      - run: |
          echo "$XENVSYNC_KEY" > .xenvsync.key
          chmod 600 .xenvsync.key
      - run: xenvsync pull --env staging
      - run: npm ci && npm test`}
          </CodeBlock>
        </Section>
      </div>

      <div id="bitbucket-pipelines" className="scroll-mt-24">
        <Section title="Bitbucket Pipelines">
          <CodeBlock title="bitbucket-pipelines.yml snippet" language="yaml">
{`pipelines:
  default:
    - step:
        image: atlassian/default-image:4
        script:
          - bash scripts/install-latest-xenvsync.sh
          - echo "$XENVSYNC_KEY" > .xenvsync.key
          - chmod 600 .xenvsync.key
          - xenvsync pull --env staging
          - npm ci
          - npm test`}
          </CodeBlock>
        </Section>
      </div>

      <Section title="Use pull vs run">
        <Card className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            Use <code>xenvsync pull</code> when downstream tools require an actual .env file.
          </p>
          <p>
            Use <code>xenvsync run -- your-command</code> when you want in-memory injection and no plaintext file output.
          </p>
        </Card>
      </Section>
    </div>
  );
}
