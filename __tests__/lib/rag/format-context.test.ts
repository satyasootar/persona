import { describe, expect, it } from "vitest";
import { formatRagContext } from "@/lib/rag/format-context";
import type { SearchResult } from "@/lib/search/types";

function makeResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    title: "Example Article",
    url: "https://example.com/article",
    snippet: "A short snippet about the topic.",
    ...overrides,
  };
}

describe("formatRagContext", () => {
  it("returns a no-results fallback message", () => {
    const context = formatRagContext([], "next.js 16 features");

    expect(context).toContain("No results found");
    expect(context).toContain("next.js 16 features");
    expect(context).toContain("Answer from your knowledge");
  });

  it("formats search hits with title, url, and snippet", () => {
    const results = [
      makeResult({
        title: "Next.js Blog",
        url: "https://nextjs.org/blog",
        snippet: "App Router improvements and caching updates.",
      }),
    ];

    const context = formatRagContext(results, "next.js updates");

    expect(context).toContain("Retrieved web context");
    expect(context).toContain('Search query: "next.js updates"');
    expect(context).toContain("### Source 1: Next.js Blog");
    expect(context).toContain("URL: https://nextjs.org/blog");
    expect(context).toContain("App Router improvements");
    expect(context).toContain("answer naturally in persona voice");
  });

  it("truncates very long snippets", () => {
    const longSnippet = "x".repeat(800);
    const context = formatRagContext(
      [makeResult({ snippet: longSnippet })],
      "query",
    );

    expect(context).toContain("…");
    expect(context.length).toBeLessThan(longSnippet.length + 500);
  });

  it("stops adding sources when total context budget is exceeded", () => {
    const results = Array.from({ length: 20 }, (_, i) =>
      makeResult({
        title: `Source ${i + 1}`,
        url: `https://example.com/${i}`,
        snippet: "y".repeat(400),
      }),
    );

    const context = formatRagContext(results, "large result set");
    const sourceCount = (context.match(/### Source/g) ?? []).length;

    expect(sourceCount).toBeGreaterThan(0);
    expect(sourceCount).toBeLessThan(results.length);
  });
});
