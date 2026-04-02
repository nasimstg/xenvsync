import type { MetadataRoute } from "next";

const baseUrl = "https://xenvsync.softexforge.io";

const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/examples", priority: 0.85, changeFrequency: "weekly" },
  { path: "/examples/workflows", priority: 0.8, changeFrequency: "monthly" },
  { path: "/examples/usages", priority: 0.8, changeFrequency: "monthly" },
  { path: "/donate", priority: 0.7, changeFrequency: "monthly" },
  { path: "/roadmap", priority: 0.8, changeFrequency: "monthly" },
  { path: "/use-cases", priority: 0.8, changeFrequency: "monthly" },
  { path: "/integrations", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/tool-comparison", priority: 0.75, changeFrequency: "monthly" },
  { path: "/blog/tool-ranking", priority: 0.75, changeFrequency: "monthly" },
  { path: "/blog/use-case-story", priority: 0.75, changeFrequency: "monthly" },
  { path: "/blog/developer-workflow", priority: 0.75, changeFrequency: "monthly" },
  { path: "/blog/technical-deep-dive", priority: 0.75, changeFrequency: "monthly" },
  { path: "/blog/migration-playbook", priority: 0.75, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.5, changeFrequency: "monthly" },
  { path: "/license", priority: 0.5, changeFrequency: "monthly" },
  { path: "/licence", priority: 0.35, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/consent", priority: 0.45, changeFrequency: "monthly" },
  { path: "/docs", priority: 0.9, changeFrequency: "weekly" },
  { path: "/docs/getting-started", priority: 0.9, changeFrequency: "weekly" },
  { path: "/docs/installation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/troubleshooting", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/commands", priority: 0.8, changeFrequency: "weekly" },
  { path: "/docs/ci-cd", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs/migration", priority: 0.8, changeFrequency: "monthly" },
  { path: "/docs/security", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs/changelog", priority: 0.6, changeFrequency: "monthly" },
  { path: "/docs/contributing", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}