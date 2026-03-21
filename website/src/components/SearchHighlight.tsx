"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function HighlightWorker() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");

  useEffect(() => {
    if (!q) return;

    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return;

    // Small delay to ensure page content is rendered
    const timer = setTimeout(() => {
      const article = document.querySelector("article") || document.querySelector("main");
      if (!article) return;

      // Walk all text nodes and wrap matches in <mark>
      const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, null);
      const matches: { node: Text; index: number; length: number }[] = [];

      let textNode: Text | null;
      while ((textNode = walker.nextNode() as Text | null)) {
        // Skip script/style/code-input nodes
        const parent = textNode.parentElement;
        if (!parent) continue;
        const tag = parent.tagName.toLowerCase();
        if (tag === "script" || tag === "style" || tag === "noscript") continue;

        const text = textNode.textContent || "";
        const lower = text.toLowerCase();

        for (const term of terms) {
          let startIdx = 0;
          let idx: number;
          while ((idx = lower.indexOf(term, startIdx)) !== -1) {
            matches.push({ node: textNode, index: idx, length: term.length });
            startIdx = idx + term.length;
          }
        }
      }

      if (matches.length === 0) return;

      // Process matches in reverse document order so earlier indices stay valid
      const processed = new Set<Text>();
      const marks: HTMLElement[] = [];

      // Group by node, sort by index descending
      const byNode = new Map<Text, { index: number; length: number }[]>();
      for (const m of matches) {
        const arr = byNode.get(m.node) || [];
        arr.push(m);
        byNode.set(m.node, arr);
      }

      for (const [node, nodeMatches] of byNode) {
        if (processed.has(node)) continue;
        processed.add(node);

        // Sort descending so we can split from the end
        const sorted = nodeMatches.sort((a, b) => b.index - a.index);

        let current: Text = node;
        for (const { index, length } of sorted) {
          if (index + length > (current.textContent?.length || 0)) continue;

          const after = current.splitText(index + length);
          const match = current.splitText(index);

          const mark = document.createElement("mark");
          mark.className = "search-highlight";
          mark.textContent = match.textContent;
          match.parentNode?.replaceChild(mark, match);
          marks.push(mark);

          // Continue with the part before the split
          void after;
        }
      }

      // Scroll to first highlight
      if (marks.length > 0) {
        const first = marks[marks.length - 1]; // last pushed = first in document
        first.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Clean up highlights after 6 seconds
      const cleanup = setTimeout(() => {
        for (const mark of marks) {
          const parent = mark.parentNode;
          if (!parent) continue;
          const text = document.createTextNode(mark.textContent || "");
          parent.replaceChild(text, mark);
          parent.normalize();
        }
      }, 6000);

      return () => clearTimeout(cleanup);
    }, 300);

    return () => clearTimeout(timer);
  }, [q]);

  return null;
}

export function SearchHighlight() {
  return (
    <Suspense fallback={null}>
      <HighlightWorker />
    </Suspense>
  );
}
