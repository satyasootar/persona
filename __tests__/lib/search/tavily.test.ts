import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWebSearchConfigError,
  isWebSearchConfigured,
  searchWeb,
} from "@/lib/search/tavily";

const ORIGINAL_ENV = process.env.TAVILY_API_KEY;

describe("Tavily config helpers", () => {
  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.TAVILY_API_KEY;
    } else {
      process.env.TAVILY_API_KEY = ORIGINAL_ENV;
    }
  });

  it("reports missing API key", () => {
    delete process.env.TAVILY_API_KEY;

    expect(isWebSearchConfigured()).toBe(false);
    expect(getWebSearchConfigError()).toContain("TAVILY_API_KEY");
  });

  it("rejects keys without the tvly- prefix", () => {
    process.env.TAVILY_API_KEY = "ytvly-invalid-key";

    expect(isWebSearchConfigured()).toBe(false);
    expect(getWebSearchConfigError()).toContain("tvly-");
  });

  it("accepts a valid key with optional quotes trimmed", () => {
    process.env.TAVILY_API_KEY = '"tvly-test-key-123"';

    expect(isWebSearchConfigured()).toBe(true);
    expect(getWebSearchConfigError()).toBeNull();
  });
});

describe("searchWeb", () => {
  beforeEach(() => {
    process.env.TAVILY_API_KEY = "tvly-test-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (ORIGINAL_ENV === undefined) {
      delete process.env.TAVILY_API_KEY;
    } else {
      process.env.TAVILY_API_KEY = ORIGINAL_ENV;
    }
  });

  it("returns empty results for blank queries without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await searchWeb("   ");

    expect(result).toEqual({ query: "", results: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps Tavily API responses into SearchResult objects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              title: "Result One",
              url: "https://example.com/one",
              content: "First snippet content",
              score: 0.91,
            },
          ],
        }),
      }),
    );

    const result = await searchWeb("react server components");

    expect(result.query).toBe("react server components");
    expect(result.results).toEqual([
      {
        title: "Result One",
        url: "https://example.com/one",
        snippet: "First snippet content",
        score: 0.91,
      },
    ]);

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(fetchCall?.[0]).toBe("https://api.tavily.com/search");
    expect(fetchCall?.[1]?.headers).toMatchObject({
      Authorization: "Bearer tvly-test-key",
    });
  });

  it("throws a helpful error on 401 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "unauthorized",
      }),
    );

    await expect(searchWeb("latest node release")).rejects.toThrow(
      /401.*tvly-/i,
    );
  });

  it("throws when the API key is not configured", async () => {
    delete process.env.TAVILY_API_KEY;

    await expect(searchWeb("anything")).rejects.toThrow(/TAVILY_API_KEY/);
  });
});
