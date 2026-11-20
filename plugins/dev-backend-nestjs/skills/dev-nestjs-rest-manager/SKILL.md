---
name: dev-nestjs-rest-manager
description: Manages and aligns REST client (*.rest / *.http) files with NestJS controllers. Use when creating new controllers, adding endpoints, or updating existing API functionality to keep request files in sync.
---

# NestJS REST Manager

Creates and maintains `.rest` files for testing NestJS controllers. Every controller gets a matching request file in the project's REST directory.

## Project Discovery

Before generating anything, resolve from the current project:

- **REST directory + extension**: existing `*.rest` / `*.http` files (reference: `rest/` at backend root, `.rest`). Follow existing naming.
- **Base URL**: from `.env` / config (`PORT`, `APP_PORT`, global prefix in `main.ts` via `setGlobalPrefix`). Prefer a variable over a hardcoded URL.
- **Login request**: the auth endpoint issuing the access token (may live in another service). Reuse an existing login request if one exists.
- **Controllers root**: reference `src/modules/*/api/controller` (per `dev-nestjs-module-architect`).
- If base URL or login endpoint cannot be resolved, STOP and ask the user.

## Workflow

### 1. Identify Controllers

Scan the controllers root for NestJS controllers.

### 2. Analyze Endpoints

For a target controller, identify:

- Base path from `@Controller()` decorator (plus global prefix).
- All route methods (`@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, `@All`).
- Sub-paths for each method.
- Required parameters, headers, and body structure (from DTOs).

### 3. Generate or Update .rest File

- **Location**: `<rest-dir>/<controller-kebab-case>.rest`
- **Conventions**: Follow [references/rest-conventions.md](references/rest-conventions.md).
- **Base URL**: From Project Discovery.
- **Auth**: Reference the login request for endpoints behind the auth guard.

### 4. Verification

The `.rest` file matches the controller's current state. If the controller changed, update the existing file: append new endpoints, update changed ones, remove deleted ones.

## Example Usage

- "Create a .rest file for the new WebhookController"
- "Update api-user.rest with the new profile-update endpoint"
- "Check if all controllers have corresponding .rest files"

## Conventions

- **1 controller per database entity**: each entity has a dedicated controller with a path matching the entity name — if the project follows this rule.
- **1 `.rest` file per controller**.
- **Path-param entities**: when controllers resolve entities via pipes (entity-resolving + ownership pipes, see `dev-nestjs-api-jwt-guards`), include samples for success, not-found, and — for ownership-guarded endpoints — the forbidden / cross-owner paths.
