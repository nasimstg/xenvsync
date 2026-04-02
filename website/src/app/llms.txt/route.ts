import { NextResponse } from "next/server";

const body = `# xenvsync

> Local-first encrypted .env workflow for teams.

Primary site: https://xenvsync.softexforge.io
Repository: https://github.com/nasimstg/xenvsync

## Core docs
- Getting started: https://xenvsync.softexforge.io/docs/getting-started
- Installation: https://xenvsync.softexforge.io/docs/installation
- Commands: https://xenvsync.softexforge.io/docs/commands
- Security model: https://xenvsync.softexforge.io/docs/security
- FAQ: https://xenvsync.softexforge.io/docs/faq
- Use cases: https://xenvsync.softexforge.io/use-cases
- Troubleshooting: https://xenvsync.softexforge.io/docs/troubleshooting
- Integrations: https://xenvsync.softexforge.io/integrations
- CI/CD recipes: https://xenvsync.softexforge.io/docs/ci-cd
- Migration guides: https://xenvsync.softexforge.io/docs/migration

## Examples
- Examples hub: https://xenvsync.softexforge.io/examples
- Workflow examples: https://xenvsync.softexforge.io/examples/workflows
- Usage examples: https://xenvsync.softexforge.io/examples/usages

## Blog
- Blog index: https://xenvsync.softexforge.io/blog
- Tool comparison: https://xenvsync.softexforge.io/blog/tool-comparison
- Tool ranking: https://xenvsync.softexforge.io/blog/tool-ranking
- Use-case story: https://xenvsync.softexforge.io/blog/use-case-story
- Developer workflow: https://xenvsync.softexforge.io/blog/developer-workflow
- Technical deep dive: https://xenvsync.softexforge.io/blog/technical-deep-dive
- Migration playbook: https://xenvsync.softexforge.io/blog/migration-playbook

## Project pages
- Changelog: https://xenvsync.softexforge.io/docs/changelog
- Contributing: https://xenvsync.softexforge.io/docs/contributing
- Roadmap: https://xenvsync.softexforge.io/roadmap
- Donate: https://xenvsync.softexforge.io/donate

## Legal and contact
- Privacy: https://xenvsync.softexforge.io/privacy
- Terms: https://xenvsync.softexforge.io/terms
- License: https://xenvsync.softexforge.io/license
- Contact: https://xenvsync.softexforge.io/contact
- Consent preferences: https://xenvsync.softexforge.io/consent

## Product summary
xenvsync encrypts environment variables using AES-256-GCM and supports team sharing through X25519 recipients.
It keeps plaintext secrets out of Git and can inject secrets directly into child processes in-memory.
`;

export function GET() {
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
