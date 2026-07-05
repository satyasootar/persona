import { describe, expect, it } from "vitest";
import { buildMessageContext } from "@/lib/context/build-context";
import {
  alternatingThread,
  longText,
  makeMessage,
} from "../../helpers/chat";

const SYSTEM_PROMPT = "You are a mentor persona.";

describe("buildMessageContext", () => {
  it("includes persona system prompt and trailing brevity nudge", () => {
    const { messages } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history: [],
    });

    expect(messages[0]).toEqual({
      role: "system",
      content: SYSTEM_PROMPT,
    });
    expect(messages.at(-1)?.content).toContain("under 100 words");
  });

  it("filters empty messages from history", () => {
    const { messages, meta } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history: [
        makeMessage("1", "user", "   "),
        makeMessage("2", "user", "Hello"),
      ],
    });

    const userMessages = messages.filter((m) => m.role === "user");
    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].content).toBe("Hello");
    expect(meta.totalMessages).toBe(1);
  });

  it("injects RAG context after the persona system prompt", () => {
    const rag = "## Retrieved web context\nSnippet about Next.js 16";
    const { messages, meta } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history: [makeMessage("1", "user", "What is new in Next.js?")],
      ragContext: rag,
    });

    expect(messages[1]).toEqual({ role: "system", content: rag });
    expect(meta.ragActive).toBe(true);
  });

  it("merges dropped turns into an updated summary block", () => {
    const history = alternatingThread(10, (i) =>
      longText(`message-${i}`),
    );

    const { messages, updatedSummary, meta } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history,
    });

    expect(meta.droppedMessages).toBeGreaterThan(0);
    expect(meta.summaryActive).toBe(true);
    expect(updatedSummary).toContain("Earlier in this conversation");
    expect(
      messages.some(
        (m) =>
          m.role === "system" &&
          m.content.includes("Conversation memory"),
      ),
    ).toBe(true);
  });

  it("preserves an existing summary when nothing is dropped", () => {
    const existing = "Student prefers short answers about Docker.";
    const { updatedSummary, meta } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history: [makeMessage("1", "user", "Hi")],
      existingSummary: existing,
    });

    expect(updatedSummary).toBe(existing);
    expect(meta.summaryActive).toBe(true);
    expect(meta.droppedMessages).toBe(0);
  });

  it("does not start kept history on a lone assistant message", () => {
    const history = [
      makeMessage("1", "assistant", "Welcome back!"),
      makeMessage("2", "user", "Explain closures"),
      makeMessage("3", "assistant", "Closures capture lexical scope."),
    ];

    const { messages } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history,
    });

    const firstConversationRole = messages.find(
      (m) => m.role === "user" || m.role === "assistant",
    )?.role;

    expect(firstConversationRole).toBe("user");
  });

  it("truncates oversized individual messages", () => {
    const huge = "a".repeat(5000);
    const { messages } = buildMessageContext({
      systemPrompt: SYSTEM_PROMPT,
      history: [makeMessage("1", "user", huge)],
    });

    const userMsg = messages.find((m) => m.role === "user");
    expect(userMsg?.content).toContain("[truncated]");
    expect(userMsg?.content.length).toBeLessThan(huge.length);
  });
});
