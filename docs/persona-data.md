# Persona Data Collection & Preparation

This document describes how persona knowledge was gathered and structured for the Mentor Studio chat application.

## Sources

Persona profiles were built from publicly available content:

### Hitesh Choudhary

| Source | URL | What we extracted |
|--------|-----|-------------------|
| Official site | [hitesh.ai](https://hitesh.ai/) | VS Code-themed educator brand, professional positioning |
| Chai aur Code channel | YouTube (770K+ subs) | Conversational Hinglish tone, long-form project tutorials |
| Hitesh Choudhary channel | YouTube | MERN, JavaScript, React deep dives |
| freeCodeCamp podcast #175 | [Article](https://www.freecodecamp.org/news/from-electrical-engineering-student-to-cto-with-hitesh-choudhary-podcast-175/) | Career arc (EE → CTO), teaching philosophy |
| SigmaStory profile | [Article](https://sigmastory.in/chai-aur-code-hitesh-choudhary-redefining-how-india-learns-programming/) | "Chai over code" metaphor, bilingual delivery, honesty about setbacks |
| Developer Journey podcast | YouTube | Interview communication style, thought-process emphasis |

### Piyush Garg

| Source | URL | What we extracted |
|--------|-----|-------------------|
| Official site | [piyushgarg.dev](https://www.piyushgarg.dev/) | Product portfolio (Teachyst, WisprType, Skyping), cohort programs |
| GitHub profile | [github.com/piyushgarg-dev](https://github.com/piyushgarg-dev) | "I build software and teach people how to build software" |
| Udemy instructor page | [Udemy](https://www.udemy.com/user/piyush-garg-1163/) | "I build devs, not just apps", hands-on fast-paced style |
| Guestbook | [piyushgarg.dev/guestbook](https://www.piyushgarg.dev/guestbook) | Student feedback: straightforward, anticipates doubts, humble tone |
| YouTube (396K+ subs) | Recent titles on site | GenAI, Docker, system design, AWS/serverless focus |

## Data Preparation Pipeline

```
Public content → Trait extraction → Structured persona card → System prompt
```

### Step 1: Trait extraction

For each educator we identified recurring patterns across sources:

- **Vocabulary**: Hinglish markers (Hitesh) vs precise technical terms (Piyush)
- **Teaching structure**: Chai-style narrative (Hitesh) vs numbered steps first (Piyush)
- **Topic expertise**: MERN/DSA/DevOps vs Node/Docker/GenAI/AWS
- **Personality**: Warm mentor (Hitesh) vs direct builder-educator (Piyush)
- **Boundaries**: Educational simulation disclaimer, no impersonation for sensitive advice

### Step 2: Structured persona cards

Each persona is defined in `lib/personas/{hitesh,piyush}.ts` with:

- `systemPrompt` — full behavioral instructions for the LLM
- UI metadata — accent colors, topics, taglines, website links

### Step 3: No fine-tuning

We use **prompt engineering only** (no model fine-tuning). This keeps the stack simple, deployable, and easy to iterate. Persona fidelity comes from detailed system prompts grounded in real public content.

## Files

| File | Purpose |
|------|---------|
| `lib/personas/hitesh.ts` | Hitesh system prompt + metadata |
| `lib/personas/piyush.ts` | Piyush system prompt + metadata |
| `lib/personas/types.ts` | Shared TypeScript interfaces |
| `lib/personas/index.ts` | Persona registry |

## Iteration Notes

To improve persona accuracy:

1. Add few-shot examples inside the system prompt (sample Q&A pairs)
2. Expand topic-specific sections (e.g., dedicated RAG guidance for Piyush)
3. Collect user feedback on "out of character" responses and refine prompts
