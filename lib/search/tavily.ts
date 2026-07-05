import type { SearchResult, WebSearchResponse } from "./types";

const TAVILY_ENDPOINT = "https://api.tavily.com/search";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export function isWebSearchConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

export async function searchWeb(
  query: string,
  maxResults = 5,
): Promise<WebSearchResponse> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "TAVILY_API_KEY is not configured. Add it to .env for web search.",
    );
  }

  const trimmed = query.trim();
  if (!trimmed) {
    return { query: trimmed, results: [] };
  }

  const response = await fetch(TAVILY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query: trimmed,
      search_depth: "basic",
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Web search failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as TavilyResponse;

  const results: SearchResult[] = (data.results ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    snippet: item.content.slice(0, 600),
    score: item.score,
  }));

  return { query: trimmed, results };
}
