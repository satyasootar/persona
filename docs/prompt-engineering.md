# Prompt Engineering Strategy

## Overview

Persona fidelity is achieved through **layered system prompts** rather than fine-tuning. Each persona prompt is structured in consistent sections so the model receives clear, non-conflicting instructions.

## Prompt Architecture

```
┌─────────────────────────────────────┐
│ Identity & background               │  Who they are, credentials
├─────────────────────────────────────┤
│ Communication style (CRITICAL)      │  Tone, vocabulary, pacing
├─────────────────────────────────────┤
│ Teaching approach                   │  How they explain concepts
├─────────────────────────────────────┤
│ Boundaries                          │  Safety, simulation disclaimer
├─────────────────────────────────────┤
│ Response format                     │  Markdown, length, structure
└─────────────────────────────────────┘
```

## Key Techniques

### 1. Style anchoring with "CRITICAL" markers

Both prompts label the communication style section as `CRITICAL — follow closely`. This increases adherence to tone-specific instructions (Hinglish for Hitesh, fast-paced directness for Piyush).

### 2. Contrastive persona design

Hitesh and Piyush are deliberately differentiated on axes the model can latch onto:

| Axis | Hitesh | Piyush |
|------|--------|--------|
| Language | Hinglish mix | English, technical |
| Pace | Conversational, story-led | Fast, structured |
| Metaphor | Chai, cricket, jugaad | Architecture boxes, deploy pipelines |
| Opening | Human hook + explanation | Core idea first, then steps |
| Closing | "Samajh aa gaya?" check-in | Concrete build task tonight |

### 3. Negative constraints

Both prompts specify what **not** to do:

- Don't break character unless asked about AI
- Don't be stiff/academic (Hitesh) or fluffy/over-explain (Piyush)
- Don't give legal/medical/financial advice

### 4. Format instructions

Explicit markdown rules ensure readable chat output:

- `**bold**` for key terms
- Fenced code blocks with language tags
- ~400 word cap for simple questions (prevents rambling)

### 5. Temperature tuning

```typescript
temperature: 0.75
```

Balanced between creative persona expression (Hinglish phrases, analogies) and factual coherence for technical content.

## Model Selection

```typescript
model: "mistral-small-latest"
```

`mistral-small-latest` offers strong instruction-following at low latency — suitable for interactive chat. Swap to `mistral-large-latest` in `lib/mistral.ts` for higher fidelity on complex system design questions.

## API Integration

The OpenAI SDK connects to Mistral's compatible endpoint:

```typescript
new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});
```

System prompt is injected as the first message on every request — never stored in client history to avoid duplication and token waste.

## Future Improvements

1. **Few-shot examples**: Add 2–3 in-character Q&A pairs per persona inside the system prompt
2. **Dynamic prompt sections**: Inject topic-specific guidance when user asks about Docker vs DSA
3. **Response post-processing**: Strip AI disclaimers that slip through character
4. **Evaluation loop**: Score responses against a rubric (Hinglish density, project references, etc.)
