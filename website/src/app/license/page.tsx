import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Card, PageHeader, Section } from "@/components/DocsComponents";

export const metadata = {
  title: "License - xenvsync",
  description: "MIT License text for xenvsync, synchronized from the repository root LICENSE file.",
  openGraph: {
    title: "License - xenvsync",
    description: "The full MIT License used by xenvsync.",
    url: "https://xenvsync.softexforge.io/license",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/license" },
};

const fallbackLicenseText = `MIT License

Copyright (c) 2026 xenvsync contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

async function loadRepositoryLicense() {
  // Website lives in /website; repository LICENSE is one level above.
  const licensePath = path.join(process.cwd(), "..", "LICENSE");

  try {
    const raw = await fs.readFile(licensePath, "utf8");
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : fallbackLicenseText;
  } catch {
    return fallbackLicenseText;
  }
}

export default async function LicensePage() {
  const licenseText = await loadRepositoryLicense();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <PageHeader
        title="License"
        description="xenvsync is distributed under the MIT License."
      />

      <Section title="MIT License">
        <Card className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            This page renders the license text from the repository root to keep website and source terms aligned.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {licenseText}
          </pre>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Source file: <Link href="https://github.com/nasimstg/xenvsync/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">LICENSE on GitHub</Link>
          </p>
        </Card>
      </Section>
    </div>
  );
}
