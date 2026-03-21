import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchHighlight } from "@/components/SearchHighlight";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://xenvsync.softexforge.io"),
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
  },
  twitter: {
    card: "summary_large_image",
    title: "xenvsync",
    description: "Encrypt, commit, and inject .env secrets. No cloud required.",
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
        <Header />
        <SearchHighlight />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
