import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap - xenvsync",
  description:
    "See what's planned for xenvsync V2 — multi-environment support, asymmetric cryptography, CI/CD integrations, and more. V1 is complete with 7 phases delivered.",
  openGraph: {
    title: "Roadmap - xenvsync",
    description: "V2 roadmap: multi-environment support, asymmetric crypto, CI/CD integrations, and more.",
    url: "https://xenvsync.softexforge.io/roadmap",
  },
  alternates: { canonical: "https://xenvsync.softexforge.io/roadmap" },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
