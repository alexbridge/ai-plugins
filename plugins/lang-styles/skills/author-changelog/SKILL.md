---
name: author-changelog
description: Write in the changelog (what-only) register — state what changed, one fact per line, drop the why. Use when writing or rewriting CHANGELOG / release-notes entries, "what's new" lists, or any user-facing change summary where the reader needs the delta, not the rationale. Trigger on "changelog", "release notes", "what changed", "what-only", or a request to strip the why from change descriptions.
---

# Changelog register (what-only)

State **what** changed. Drop **why**. The reader wants the delta, not the rationale.

## When to use

- CHANGELOG.md / release-notes entries.
- "What's new" lists, in-app update notes.
- Any user-facing change summary.

Not for: TRD/design docs (rationale stays), commit bodies (the why belongs there), code comments.

## Rules

- One feature per bullet. Fold its facets (sub-commands, options, UI entry points, persistence) into that single line, comma- or semicolon-separated — don't spread one feature across 5+ bullets.
- Split bullets only across *distinct* features or fixes, not across aspects of the same one. A `because` / "so that" is still a cut (the why), not a split.
- Lead with the changed thing or behavior.
- Present tense, declarative. "Binary cells render as `<binary N bytes>`." Not "We now render…".
- Drop the why. No "to avoid…", "because…", "so that…", "this prevents…".
- Drop hedging and quality-adjectives: "robust", "seamless", "simply", "comprehensive".
- Name exact identifiers: settings, keys, columns, commands in `code`.
- Group under **Feature** / **Bug fix** (or the project's existing headers).

## What stays vs what goes

| Keep (what) | Cut (why) |
|-------------|-----------|
| `Default Page Size` setting is a dropdown. | …so users pick a value faster. |
| Binary cells render as `<binary N bytes>`. | …to avoid a multi-GB int-array blowup. |
| Copy to connection: generated columns skipped. | …because MySQL rejects an explicit value. |

If the reader needs the why, it belongs in the commit body or the linked ticket — not the changelog.

## Bad vs Good

**Bad** (why folded in, compound, hedged):
> - CSV/Markdown export now exports binary cells as the JSON marker (same as SQL Insert), which fixes the confusing `[object Object]` output users were seeing.

**Good** (what-only, one fact per line):
> - CSV/Markdown export: binary cells export as the JSON marker, same as SQL Insert.

## Grouping facets of one feature

**Bad** (one feature spread across 7 bullets):
> - Connection tree: separator rows group connections.
> - `Add Separator` button in the tree title bar.
> - Separator label accepts any text, including emoji.
> - Connections and separators reorder via inline `Move Up` / `Move Down`.
> - Separators rename and delete inline.
> - Deleting a separator keeps the connections under it.
> - Connection order and separators persist across reloads.

**Good** (one bullet, facets folded):
> - Connection tree: separator rows group connections; add from the title bar, rename/delete inline, reorder with `Move Up` / `Move Down`, labels accept emoji. Order persists across reloads.

## Smell test

Read the line alone. If it tells the reader *why* the change exists rather than *what* changed — cut the why or move it to the commit/ticket.

Read the section. If 4+ bullets all name the same feature, fold them into one bullet with the facets inline.
