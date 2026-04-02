import { permanentRedirect } from "next/navigation";

export const metadata = { title: "Roadmap - xenvsync" };

export default function DocsRoadmap() {
  permanentRedirect("/roadmap");
}
