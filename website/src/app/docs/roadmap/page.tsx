import { redirect } from "next/navigation";

export const metadata = { title: "Roadmap - xenvsync" };

export default function DocsRoadmap() {
  redirect("/roadmap");
}
