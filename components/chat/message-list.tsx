"use client";

import type { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { cn } from "@/lib/utils";
import type { ChatMessage, PersonaProfile } from "@/lib/personas/types";

interface MessageBubbleProps {
  message: ChatMessage;
  persona: PersonaProfile;
  isStreaming?: boolean;
}

export function MessageBubble({
  message,
  persona,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmptyAssistant =
    !isUser && !message.content.trim() && isStreaming;

  if (isEmptyAssistant) {
    return (
      <div className="flex w-full items-center justify-start gap-2">
        <PersonaAvatar persona={persona} size="sm" />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Thinking…
        </span>
      </div>
    );
  }

  if (!isUser && !message.content.trim()) return null;

  return (
    <div
      className={cn(
        "flex w-full gap-2.5",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <PersonaAvatar persona={persona} size="sm" className="mt-0.5 shrink-0" />
      ) : null}

      <div
        className={cn(
          "max-w-[min(92%,36rem)] rounded-sm border px-3.5 py-2.5 text-[13px] leading-relaxed",
          isUser
            ? "border-border bg-muted/50 text-foreground"
            : "border-border bg-card text-card-foreground",
        )}
        style={
          !isUser
            ? { borderLeftWidth: 2, borderLeftColor: persona.accent }
            : undefined
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            <MarkdownContent content={message.content} />
            {isStreaming && message.content ? (
              <span
                className="ml-0.5 inline-block h-3.5 w-px animate-pulse"
                style={{ backgroundColor: persona.accent }}
                aria-hidden
              />
            ) : null}
          </>
        )}
      </div>

      {isUser ? (
        <Avatar className="mt-0.5 h-7 w-7 shrink-0 rounded-sm border border-border">
          <AvatarFallback className="rounded-sm bg-secondary text-[10px] font-medium text-secondary-foreground">
            You
          </AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}

interface MessageListProps {
  messages: ChatMessage[];
  persona: PersonaProfile;
  isStreaming: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  persona,
  isStreaming,
  bottomRef,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 py-10 text-center">
        <PersonaAvatar persona={persona} size="lg" active />
        <div className="max-w-sm space-y-1">
          <h3 className="font-display text-lg font-semibold">
            Ask {persona.name.split(" ")[0]}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {persona.id === "hitesh"
              ? "MERN, DSA, career — short chai-style answers."
              : "Node, Docker, GenAI — direct, project-first answers."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-end">
      <div className="w-full space-y-3.5 py-3">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            persona={persona}
            isStreaming={
              isStreaming &&
              index === messages.length - 1 &&
              message.role === "assistant"
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
