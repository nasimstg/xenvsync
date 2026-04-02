import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsentBanner } from "@/components/ConsentBanner";
import { SearchHighlight } from "@/components/SearchHighlight";
import "./globals.css";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "xenvsync",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Linux, macOS, Windows",
    description:
      "Encrypt, commit, and inject .env secrets with AES-256-GCM and X25519 team sharing.",
    url: "https://xenvsync.softexforge.io",
    sameAs: ["https://github.com/nasimstg/xenvsync"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "xenvsync",
    url: "https://xenvsync.softexforge.io",
    inLanguage: "en",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://xenvsync.softexforge.io"),
  applicationName: "xenvsync",
  title: "xenvsync - Encrypted Environment Variables for Teams",
  description:
    "Encrypt, commit, and inject .env secrets with AES-256-GCM. No cloud required. A fast, cross-platform CLI tool for secure local development.",
  keywords: [
    "env",
    "dotenv",
    "encryption",
    "secrets",
    "cli",
    "environment variables",
    "aes-256",
    "golang",
  ],
  authors: [{ name: "Md Nasim Sheikh", url: "https://www.nasimstg.dev" }],
  creator: "Md Nasim Sheikh",
  openGraph: {
    title: "xenvsync",
    description: "Encrypt, commit, and inject .env secrets. No cloud required.",
    type: "website",
    url: "https://xenvsync.softexforge.io",
    siteName: "xenvsync",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "xenvsync - Encrypt .env, commit with confidence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "xenvsync",
    description: "Encrypt, commit, and inject .env secrets. No cloud required.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://xenvsync.softexforge.io",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Header />
        <SearchHighlight />
        <main className="flex-1">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
