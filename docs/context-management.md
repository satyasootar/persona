# Context Management

## Problem

LLMs have finite context windows. Long mentoring conversations must stay coherent without losing earlier topics, blowing the token budget, or breaking turn structure.

## Strategy: Tiered Context

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1 — Persona system prompt (always)                │
├─────────────────────────────────────────────────────────┤
│ Layer 2 — Rolling conversation memory (when pruned)     │
│   Heuristic summary of dropped turns                    │
├─────────────────────────────────────────────────────────┤
│ Layer 3 — Recent turns (token-budgeted from the end)    │
│   Full user/assistant messages, pair-integrity safe     │
└─────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Token-budget pruning (not just message count)

Recent messages are kept from the **end** until a **6,000 token** history budget is reached (estimated as ~4 chars/token).

| Constant | Value | Purpose |
|----------|-------|---------|
| `maxHistoryTokens` | 6,000 | Room for recent full turns |
| `minRecentMessages` | 6 | Floor — never prune below 3 exchanges |
| `maxMessages` | 40 | Hard safety cap |
| `maxCharsPerMessage` | 4,000 | Prevents log-dump hijacking |
| `maxSummaryChars` | 900 | Caps rolling memory block |

### 2. Turn-pair integrity

When pruning from the start, we never leave a lone `assistant` message at the beginning of the kept window — context always starts on a `user` turn so the model isn't confused.

### 3. Rolling heuristic summary (no extra LLM call)

When older messages are dropped, we build a compact memory block:

- **Student asked about:** first line of each dropped user message
- **You already explained:** first line of each dropped assistant reply
- Instruction to continue naturally without repeating

This summary is **merged** with any existing summary from prior prunes and persisted client-side.

### 4. Client-persisted memory

```typescript
localStorage["persona-chat:v2:hitesh"] = {
  messages: ChatMessage[],  // full UI history (unlimited display)
  summary: string | null    // rolling memory sent back to server
}
```

The UI shows all messages; the API only receives what fits the budget + the summary.

### 5. Per-persona isolation

Hitesh and Piyush each have separate `messages` and `summary` — no cross-contamination.

## Request Flow

```
Client                              Server
  │                                   │
  │ POST /api/chat                    │
  │ { personaId, messages[], summary }│
  │ ─────────────────────────────────►│
  │                                   │ normalize + trim messages
  │                                   │ selectWithinBudget(6000 tokens)
  │                                   │ buildDroppedSummary(pruned)
  │                                   │ mergeSummaries(existing, new)
  │                                   │ assemble [system, memory?, ...recent]
  │                                   │ stream from Mistral
  │◄───────────────────────────────── │
  │ text/plain stream                 │
  │ X-Conversation-Summary: ...         │  ← client persists this
  │ X-Context-Kept / Dropped / Tokens │
```

## Response Headers

| Header | Description |
|--------|-------------|
| `X-Conversation-Summary` | Updated rolling memory (URI-encoded) |
| `X-Context-Kept` | Messages sent to the model |
| `X-Context-Dropped` | Messages compressed into summary |
| `X-Context-Tokens` | Estimated input token count |

## Files

| File | Role |
|------|------|
| `lib/context/tokens.ts` | Limits and token estimation |
| `lib/context/summary.ts` | Heuristic summary build + merge |
| `lib/context/build-context.ts` | Main assembly logic |
| `hooks/use-persona-chat.ts` | Persist messages + summary |

## Why Not LLM Summarization?

Summarizing old turns with a second API call adds latency, cost, and failure modes. Heuristic extraction of user questions + assistant highlights works well for mentoring chat where topics are discrete ("MERN roadmap", "Docker networking").

For v2, an optional `after()` summarization pass could refine the memory block on prune events.

## Clearing Context

"Clear chat" resets both `messages` and `summary` for that persona — a full fresh start.
