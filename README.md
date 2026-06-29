# ai-plugins

Claude Code plugin marketplace (`abridge-marketplace`).

## Plugins

| Plugin | Description |
|--------|-------------|
| `lang-styles` | Writing-register skills for technical artifacts. |

## lang-styles skills

All skills are namespaced `author-*` — the author is whoever produces the text outcome; the skill defines how that author writes.

| Skill | Register |
|-------|----------|
| `author-changelog` | Changelog (what-only) — state what changed, one fact per line, drop the why. |
| `author-code-comment` | Code comments (fact-first mechanism) — present-tense fact, cause first, name identifiers, never narrate the next line. |
| `author-human-comment` | External messages (lead with the ask) — B2/C1, one short paragraph, action first, draft before sending. |

## Install

```
/plugin marketplace add https://github.com/alexbridge/ai-plugins.git
```
