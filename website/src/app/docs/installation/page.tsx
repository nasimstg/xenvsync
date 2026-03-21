import { CodeBlock } from "@/components/CodeBlock";
import { Section, PageHeader, Card } from "@/components/DocsComponents";

export const metadata = {
  title: "Installation - xenvsync",
  description: "Install xenvsync via Go, prebuilt binaries, or from source. Supports Linux, macOS, and Windows on amd64 and arm64.",
  openGraph: {
    title: "Installation - xenvsync",
    description: "Install xenvsync via Go, prebuilt binaries, or from source on any platform.",
    url: "https://xenvsync.softexforge.io/docs/installation",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/docs/installation" },
};

export default function Installation() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Installation"
        description="Multiple ways to install xenvsync on any platform."
      />

      <Section title="Go Install (Recommended)">
        <p className="text-[var(--color-text-secondary)] mb-3">Requires Go 1.22+.</p>
        <CodeBlock title="Install" language="bash">
          {`$ go install github.com/nasimstg/xenvsync@latest`}
        </CodeBlock>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          This places the binary in <code>$GOPATH/bin</code>. Make sure it&apos;s in your <code>PATH</code>.
        </p>
      </Section>

      <Section title="Binary Releases">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Prebuilt binaries are available on{" "}
          <a href="https://github.com/nasimstg/xenvsync/releases" className="text-[var(--color-accent)] hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub Releases
          </a>
          .
        </p>

        <h3 className="text-base font-medium mb-2">Linux / macOS</h3>
        <CodeBlock title="Download & install" language="bash">
{`# Replace VERSION and PLATFORM (e.g., linux_amd64, darwin_arm64)
$ curl -LO https://github.com/nasimstg/xenvsync/releases/latest/download/xenvsync_VERSION_PLATFORM.tar.gz
$ tar xzf xenvsync_VERSION_PLATFORM.tar.gz
$ sudo mv xenvsync /usr/local/bin/`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">Linux (.deb / .rpm)</h3>
        <CodeBlock title="Package manager" language="bash">
{`# Debian / Ubuntu
$ sudo dpkg -i xenvsync_VERSION_linux_amd64.deb

# RHEL / Fedora
$ sudo rpm -i xenvsync_VERSION_linux_amd64.rpm`}
        </CodeBlock>

        <h3 className="text-base font-medium mt-6 mb-2">Windows</h3>
        <p className="text-[var(--color-text-secondary)]">
          Download the <code>.zip</code> from the releases page, extract it, and
          add the directory to your <code>PATH</code>.
        </p>
      </Section>

      <Section title="Build from Source">
        <CodeBlock title="Clone and build" language="bash">
{`$ git clone https://github.com/nasimstg/xenvsync.git
$ cd xenvsync
$ make build`}
        </CodeBlock>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">
          <code>make build</code> injects version, commit, and build date via ldflags.
          Use <code>make install</code> for direct install to <code>$GOPATH/bin</code>.
        </p>
      </Section>

      <Section title="Verify">
        <CodeBlock title="Check version" language="bash">
{`$ xenvsync version
xenvsync v0.1.0
  commit: abc1234
  built:  2026-03-21T00:00:00Z`}
        </CodeBlock>
      </Section>

      <Section title="Supported Platforms">
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-elevated)] text-left">
                <th className="px-4 py-3 font-medium">OS</th>
                <th className="px-4 py-3 font-medium">Architecture</th>
                <th className="px-4 py-3 font-medium">Formats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr><td className="px-4 py-2.5">Linux</td><td className="px-4 py-2.5">amd64, arm64</td><td className="px-4 py-2.5">.tar.gz, .deb, .rpm, .apk</td></tr>
              <tr><td className="px-4 py-2.5">macOS</td><td className="px-4 py-2.5">amd64, arm64</td><td className="px-4 py-2.5">.tar.gz</td></tr>
              <tr><td className="px-4 py-2.5">Windows</td><td className="px-4 py-2.5">amd64, arm64</td><td className="px-4 py-2.5">.zip</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Upgrading">
        <p className="text-[var(--color-text-secondary)] mb-3">
          Replace the binary with a newer version. Config files are forward-compatible.
        </p>
        <CodeBlock language="bash">
          {`$ go install github.com/nasimstg/xenvsync@latest`}
        </CodeBlock>
      </Section>
    </div>
  );
}
