import type { ChatMessage } from "@/lib/personas/types";

export function makeMessage(
  id: string,
  role: "user" | "assistant",
  content: string,
): ChatMessage {
  return { id, role, content, createdAt: Number(id) || 0 };
}

export function longText(label: string, chars = 6000): string {
  const prefix = `${label}: `;
  return prefix + "x".repeat(Math.max(0, chars - prefix.length));
}

export function alternatingThread(
  count: number,
  contentFactory: (index: number) => string,
): ChatMessage[] {
  return Array.from({ length: count }, (_, i) =>
    makeMessage(
      String(i),
      i % 2 === 0 ? "user" : "assistant",
      contentFactory(i),
    ),
  );
}
