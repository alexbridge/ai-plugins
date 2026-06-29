---
name: author-human-comment
description: Write external messages to other people in the lead-with-the-ask register — B2/C1 plain English, one short paragraph, action first then one reason, no hedging, draft first and wait for approval before sending. Use when drafting Jira/Slack/PR/email comments, code-review feedback, or any message addressed to a human. Trigger on "draft a comment", "reply to", "message X", "PR comment", "Slack message", "Jira comment", or any outgoing note to a person.
---

# External-message register (lead with the ask)

Every outgoing comment to another person: Jira, Slack, PR/Bitbucket/GitHub, code-review feedback, email.

## Language level

B2 / C1 — plain, direct, short. Readable on a phone.

## Rules

- One short paragraph per comment. No headers, no multi-section structure.
- Lead with the action or the ask, then one short reason.
- No hedging: skip "could you maybe", "I was wondering if", "please consider".
- No filler: "robust", "elegant", "comprehensive", "leverage", "kindly".
- Plain verbs: use, change, remove, add, revert, move, rename, check, confirm.
- Code in backticks. Ticket/PR refs as plain text (`PROJ-1234`), not screaming markdown.
- Praise belongs in its own short message, not mixed into actionable ones.
- No emojis unless asked.
- No AI-assistant boilerplate ("Generated with…", "I noticed that…", "Let me know if…").

## Length

- Ask / blocker / question: 1–3 short sentences.
- Status update / FYI: 1–2 sentences.
- Standing-by / "holding for go/no-go": 1 sentence.

If it needs more, propose a sync — don't write a wall.

## Default shape

```
[mention or context line]
[the ask or the fact, with the reason inline]
[next step or "holding for X"]
```

## Bad vs Good

**Bad:**
> Hi, I hope you're doing well. I was looking into PROJ-6551 and I noticed there might
> be a small inconsistency with the acceptance criteria. Could you please clarify whether we should
> still proceed, or whether the ticket needs to be updated? Thanks a lot in advance!

**Good:**
> @reviewer Blocker on this ticket.
>
> AC says flag `FEATURE_X` should trigger a `CARD_REQUEST`, same as the passport path.
> PROJ-6537 already removed that link — today `FEATURE_X` triggers no request.
>
> Holding for go/no-go.

## Confirmation flow

- Never auto-post. Show the draft first.
- After approval, post once — don't re-draft variants.
- If the draft is tweaked, apply the tweak literally; don't re-soften the tone.
