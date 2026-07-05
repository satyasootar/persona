import { describe, expect, it } from "vitest";
import {
  buildDroppedSummary,
  capSummary,
  mergeSummaries,
} from "@/lib/context/summary";
import { CONTEXT_LIMITS } from "@/lib/context/tokens";
import { makeMessage } from "../../helpers/chat";

describe("buildDroppedSummary", () => {
  it("returns empty string for no dropped messages", () => {
    expect(buildDroppedSummary([])).toBe("");
  });

  it("captures user topics and assistant highlights", () => {
    const dropped = [
      makeMessage("1", "user", "How do I learn React hooks?"),
      makeMessage(
        "2",
        "assistant",
        "Start with useState and useEffect. Keep components small.",
      ),
    ];

    const summary = buildDroppedSummary(dropped);

    expect(summary).toContain("Earlier in this conversation");
    expect(summary).toContain("Student asked about:");
    expect(summary).toContain("How do I learn React hooks?");
    expect(summary).toContain("You already explained:");
    expect(summary).toContain("useState and useEffect");
    expect(summary).toContain("Do not repeat full explanations");
  });

  it("truncates long lines in the summary", () => {
    const longQuestion = "Q: " + "a".repeat(200);
    const summary = buildDroppedSummary([
      makeMessage("1", "user", longQuestion),
    ]);

    expect(summary.length).toBeLessThan(longQuestion.length + 200);
    expect(summary).toContain("…");
  });
});

describe("mergeSummaries", () => {
  it("returns existing when new chunk is empty", () => {
    expect(mergeSummaries("prior memory", "")).toBe("prior memory");
    expect(mergeSummaries("prior memory", "   ")).toBe("prior memory");
  });

  it("returns capped new chunk when no existing summary", () => {
    const chunk = "fresh summary chunk";
    expect(mergeSummaries(null, chunk)).toBe(chunk);
  });

  it("joins existing and new chunks with a separator", () => {
    const merged = mergeSummaries("older", "newer section");
    expect(merged).toContain("older");
    expect(merged).toContain("---");
    expect(merged).toContain("newer section");
  });
});

describe("capSummary", () => {
  it("leaves short summaries unchanged", () => {
    const text = "short memory";
    expect(capSummary(text)).toBe(text);
  });

  it("truncates summaries longer than maxSummaryChars", () => {
    const long = "z".repeat(CONTEXT_LIMITS.maxSummaryChars + 50);
    const capped = capSummary(long);

    expect(capped.length).toBe(CONTEXT_LIMITS.maxSummaryChars);
    expect(capped.startsWith("…")).toBe(true);
    expect(capped.endsWith("z")).toBe(true);
  });
});
