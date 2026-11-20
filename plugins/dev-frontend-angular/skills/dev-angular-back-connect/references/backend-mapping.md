# Backend Mapping and Proxy Rules

Backend services vary by project. Build the service map from the project itself before any sync; never carry names, ports, or prefixes over from another project.

## Service Map

One row per backend service the frontend talks to:

| Field | Meaning |
|-------|---------|
| **Service** | Backend name (e.g., `iam`, `app`, `billing`). |
| **Prefix** | Frontend-side path the proxy matches (e.g., `/api/auth`). |
| **Target** | Proxy target (host + port). |
| **Path Rewrite** | Rewrite applied by the proxy, if any. |
| **Env Key** | `environment.*` property holding the base path used by services. |
| **Source** | Where definitions come from: MCP server name, or Swagger/OpenAPI JSON location. |

## Discovering the Map

Read, in order, and stop once every field is filled:

1. **Proxy config**: `proxy.conf.json` / `proxy.conf.js` (path from `angular.json` → `serve.options.proxyConfig`). Gives Prefix, Target, Path Rewrite.
2. **Environment files**: `src/environments/environment*.ts`. Gives Env Key per prefix.
3. **Existing services**: grep `src/app/**/services/*.service.ts` for `environment.` usage to confirm which key each module uses.
4. **Connected MCP servers**: match backend MCP servers to services by name.

If any field stays empty or two sources conflict, STOP and ask the user. Show the partial map with empty cells.

## Locating Backend Source Code

Backend source location also varies (mono-repo `../backend/<service>`, sibling repo, separate checkout). Only needed when the user asks to cross-check against source. If not found via relative paths, STOP and ask the user for the absolute path.

## Angular Integration

- Each service class uses the Env Key of its target service as base URL.
- Domain modules live per `dev-angular-module-architecture` and map to backend modules.

## Example (one project)

Illustrative only. Do not reuse without confirming against the current project.

| Service | Prefix | Target | Path Rewrite | Env Key |
|---------|--------|--------|--------------|---------|
| iam | `/api/auth` | `http://localhost:8001` | `^/api/auth` → `/auth` | `apiAuthPath` |
| app | `/api/app` | `http://localhost:8002` | `^/api/app` → (empty) | `apiAppPath` |
