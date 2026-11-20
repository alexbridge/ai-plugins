# ai-plugins

Claude Code plugin marketplace (`abridge-marketplace`).

## Plugins

| Plugin | Description |
|--------|-------------|
| `lang-styles` | Writing-register skills for technical artifacts. |
| `dev-frontend-angular` | Angular frontend development skills — FE module structure, conventions. |
| `dev-backend-nestjs` | NestJS backend development skills — BE module structure, conventions. |

## lang-styles skills

All skills are namespaced `author-*` — the author is whoever produces the text outcome; the skill defines how that author writes.

| Skill | Register |
|-------|----------|
| `author-changelog` | Changelog (what-only) — state what changed, one fact per line, drop the why. |
| `author-code-comment` | Code comments (fact-first mechanism) — present-tense fact, cause first, name identifiers, never narrate the next line. |
| `author-human-comment` | External messages (lead with the ask) — B2/C1, one short paragraph, action first, draft before sending. |
| `author-terse` | Session register (aggressive short) — answer first, fragments over sentences; rewrites the previous answer, then holds for the session. |

## dev-frontend-angular skills

All skills are namespaced `dev-angular-*`.

| Skill | Covers |
|-------|--------|
| `dev-angular-module-architecture` | Self-contained, portable domain modules under `src/app/pages/` — layout, routes entry point, Standalone + Signals + modern control flow. |
| `dev-angular-back-nestjs` | Port NestJS backend modules to Angular — one service per controller, one model file per DTO/entity, no monoliths. |
| `dev-angular-back-connect` | Sync backend models + API services into Angular modules; backend service map discovered per project. Source: backend MCP if connected, else user-supplied Swagger/OpenAPI JSON. |
| `dev-angular-coding-standards` | Angular 19+ rules — signals, `input()`/`output()`/`model()`, `@if`/`@for`, standalone + OnPush, `inject()`, `@defer`, Tailwind utility-first. |
| `dev-angular-ui-patterns` | Shared components, `svg[icon-*]` icon components, dialog service instead of `window.confirm/alert/prompt`, kebab row-action menus. |
| `dev-angular-ui-verify-playwright` | UI verification via Playwright MCP — login, drive UI, authenticated API payload check, role checks, console errors. |

## dev-backend-nestjs skills

All skills are namespaced `dev-nestjs-*`. Project-agnostic: each skill discovers the project's equivalents of the reference names/paths and stops to ask when missing.

| Skill | Covers |
|-------|--------|
| `dev-nestjs-module-architect` | Create/refactor feature modules (API/Domain/Services/Config) step by step, structure validator script, DI error debugging. |
| `dev-nestjs-api-jwt-guards` | JWT auth + RBAC guards, entity-resolving pipes, tenant/user ownership pipes. |
| `dev-nestjs-security-keys` | ES256 keys, PEM → JWK, JWKS endpoint. |
| `dev-nestjs-rest-manager` | `.rest` / `.http` request files in sync with controllers. |
| `dev-nestjs-search-api` | Search with pagination + filters: search base service, public vs internal filters, `POST /search`. |
| `dev-nestjs-typeorm` | TypeORM entities: base classes, naming, columns, relations, indexes. |
| `dev-nestjs-exceptions` | Native `@nestjs/common` exceptions, no-arg throws, global `HttpExceptionFilter` owns the envelope, no method hints on auth endpoints. |

## Install

```
/plugin marketplace add https://github.com/alexbridge/ai-plugins.git
```
