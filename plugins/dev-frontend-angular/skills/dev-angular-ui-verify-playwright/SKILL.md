---
name: dev-angular-ui-verify-playwright
description: End-to-end UI verification of an Angular change against the running local stack via the Playwright MCP server — login, navigate, fill, click, read DOM, inspect the real authenticated API payload, check console errors, multi-user role checks. Use when a task says "browser verification" / "manual verification", or the user asks to verify that a frontend change actually works in the UI.
---

# UI Verification with Playwright MCP

The "did the UI actually work?" check. Drives the real app in a real browser — signals, interceptors, guards, custom form wrappers, routing — which `curl` against the API cannot.

## Project Discovery

Collect before the first run. Ask the user for anything not found:

| Item | Where to look |
|------|---------------|
| Frontend URL | user, `angular.json` `serve.options.port`, `proxy.conf.json`, project docs (`AGENT.md`, `CLAUDE.md`) |
| API prefixes | `proxy.conf.json` (e.g. `/api/iam`, `/api/app`) |
| Login route | app routes (e.g. `/auth/login`) |
| Seeded users + passwords | seed files (grep `seed`, `password`), project docs |
| Role/group assignments | seed files for groups/roles |
| Migration command | `package.json` scripts (`migration:run`) |

## Prerequisites — check, do not fix

1. **Stack is up.** Backends + frontend dev server reachable. The user starts the stack; do not boot containers or dev servers.
2. **DB migrated.** If the change adds a migration, confirm the user ran it (or reseeded).
3. **Credentials.** A seeded user with the authz the endpoint needs. On 403 "missing required group", check the role seed.
4. **Two-user scenarios** need two users in the same tenant with the required authz. If none exist, mark the cross-user check "not reachable in current authz model" and stop.

Playwright MCP missing (`mcp__playwright__*` tools unavailable)? Propose the install and wait — it is shared user config:

```bash
claude mcp add --scope user playwright -- npx @playwright/mcp@latest
```

Gemini / Copilot / Codex: add `{"mcpServers":{"playwright":{"command":"npx","args":["@playwright/mcp@latest"]}}}` to their MCP config. WSL2: headless Linux Chromium — no Windows browser, no `DISPLAY`.

## Verification Loop

| Step | Tool | Notes |
|------|------|-------|
| Navigate | `browser_navigate` | Load the URL |
| Inspect | `browser_snapshot` | a11y tree + stable `ref=eN` handles |
| Fill | `browser_fill_form` / `browser_type` | Custom select wrappers: see below |
| Click | `browser_click` | Use `ref` from the snapshot |
| Wait | `browser_wait_for` | Text appear/disappear while loading |
| Read DOM | `browser_evaluate` | Tables, custom components, computed state |
| API payload | `browser_network_requests` + `browser_evaluate` fetch | See below |
| Dialogs | `browser_handle_dialog` | Dismiss native `alert(...)` if the app still uses them |
| Errors | `browser_console_messages` level `error` | Must be empty |

### Login / switch user

```
navigate  <frontend>/auth/login
snapshot                      → email + password refs
fill_form [email, password]
click     Sign in
```

Switch user: `browser_evaluate: () => { localStorage.clear(); sessionStorage.clear(); return 'cleared'; }`, then navigate to login again.

### Authenticated API payload

A bare `fetch()` from `browser_evaluate` has no JWT (the interceptor adds it) and returns 401. Instead:

1. Trigger a real navigation that calls the endpoint.
2. `browser_network_requests` with `requestHeaders: true`, filtered by URL substring.
3. Copy the `authorization:` header, re-run `fetch()` with it, assert on the JSON (new keys present, removed keys absent).

### Custom select wrappers

Native `selectOption` fills the `<select>` but may not reach the signal bound via `(valueChange)`. Set and dispatch:

```js
browser_evaluate: () => {
  const sel = document.querySelector('select');
  sel.value = 'ONBOARDING';
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  return sel.value;
}
```

## What to Assert

For any change touching a model or response shape:

- **List view** — column/field visible with the correct value.
- **Detail view** — new/changed fields in the metadata block and per-row captions.
- **API payload** — new keys present, removed keys absent.
- **Negative / role checks** — second user with different authz: visibility filters hold, and per-request fields (e.g. `createdByUserId`) come from the caller's JWT, not from the mutated entity.
- **Console** — no `error`-level messages for the scenario.

## Boundaries

- Drive runs only when the user asks or a task step says "browser verification".
- Never skip a failing check and tick the task.
- Drift outside the change's scope (FE/BE enum mismatch, missing seed users, broken migration): STOP and report. Do not fix silently.
- Do not edit `.playwright-mcp/` artifacts — transient.

## When Verification Is Not Possible

If a prerequisite fails and cannot be resolved in-session:

1. State exactly what was and was not verified.
2. Mark the task **not executed** — do not tick it.
3. Leave the manual-verification gate to the user.
