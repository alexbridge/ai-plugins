---
name: author-code-comment
description: Write in-source code comments in the fact-first mechanism register — state the mechanism as a present-tense fact, decision/cause first, name exact identifiers, never narrate the next line. Use when writing or rewriting inline `//`, block, or kept docblock comments, or when a comment restates the code instead of carrying the why. Trigger on "write a comment", "comment this", "rewrite the comments", "code comments", or a request to make a comment explain why instead of what.
---

# Code-comment register (fact-first mechanism)

The reader sees the comment and the line together. Do not narrate what the line does. State the WHY and the non-obvious mechanism.

## When to use

- Inline `//`, block comments, kept docblocks inside source.

Not for: changelog (`author-changelog`), TRD/design docs, commit messages, external messages.

## Rules

- State the mechanism as a **fact**, present tense, declarative. Not "we then publish…", not "this will fire…" → "Loop blocks the main thread before X fires."
- **Decision/cause first, action second.** Lead with why the situation exists, then what the code does about it.
- One claim per line. Break a two-cause comment across two lines.
- Name exact identifiers: events, states, thread, method, column — `ApplicationReadyEvent`, `ACCEPTING_TRAFFIC`, `main thread`. No vague "the probe", "the thing".

## Cut

- Spatial narration: "below", "above", "the following loop", "here we".
- Process narration: "first we", "then it", "next", "as we can see".
- Filler/hedging: "basically", "simply", "just", "note that", "obviously".
- Restating the code: a comment that re-says the line it annotates adds nothing — delete it.
- Quality adjectives: "robust", "clean", "elegant".

## Shape

`[mechanism / cause, as fact] → [what this code does and why it's safe/needed]`

## Bad vs Good

**Bad** (narrates the next line, spatial, future tense):
```java
// Bridge routes no inbound traffic; the supervisor loop below blocks the main thread so
// ApplicationReadyEvent never fires. Publish readiness explicitly so the probe reports UP.
```

**Good** (fact-first, mechanism named, one claim per line):
```java
// Supervisor loop blocks the main thread before ApplicationReadyEvent fires, so
// ReadinessState never reaches ACCEPTING_TRAFFIC and health stays OUT_OF_SERVICE.
// Fire it manually: bridge routes no inbound traffic, readiness is always UP.
```

## Smell test

Read the comment alone. If it doesn't tell a new developer something the code itself doesn't already say — delete it or rewrite it to carry the WHY.
