---
name: dev-angular-back-connect
description: Manages the connection between an Angular frontend and one or more backends (services vary by project). Use to synchronize models, services, and API methods from NestJS backends into Angular portable modules. Source of truth is the backend MCP server when available, otherwise a Swagger/OpenAPI JSON supplied by the user.
---

# Frontend-Backend Connection

Synchronizes backend features into the Angular frontend — consistent models and API services across the multi-backend architecture.

## Core Workflow: "Connect and Update Frontend by Backend"

Follow these steps precisely. Every model property and endpoint comes from the chosen source of truth (step 2), never from assumption.

### 1. Identify Target Module & Backend
-   Determine which backend module has changed (e.g., `WorkflowModule`).
-   Build the project's backend service map (name, proxy prefix, target, environment base-path key) per [backend-mapping.md](references/backend-mapping.md). Services vary by project; never assume names, ports, or prefixes.
-   Pick the target service from that map. If the module could belong to more than one service, ask the user.

### 2. Pick the Source of Truth

Check whether a backend MCP server for the target service is connected (any server exposing `list_controllers` / `get_controller_details` / `get_type_definition`).

-   **MCP connected** → use **2a**.
-   **MCP not connected** → use **2b**. The MCP server is optional; its absence is not an error.

#### 2a. Discover via MCP
-   **List Controllers**: Call `list_controllers(moduleName)` to find all controllers in the target module.
-   **Extract Details**: Call `get_controller_details(controllerPath)` for each relevant controller. This provides:
    -   Available HTTP methods and routes.
    -   Precise DTO and Entity types used in parameters and return values.
-   **Fetch Type Structures**: For **every** DTO and Entity identified, call `get_type_definition(typeName)` to get the full TypeScript structure (properties, types, decorators).

#### 2b. Discover via Swagger/OpenAPI JSON
-   **STOP and ask the user** for the Swagger/OpenAPI JSON of the target backend: a local file path or a URL (NestJS default: `/api-json` on the backend service). Do not guess a URL and do not fall back to reading backend source instead.
-   Load the document and filter to the target module:
    -   **Endpoints**: entries under `paths` tagged with the module (or matching its route prefix) — HTTP method, route, path/query params, request body, response schema.
    -   **Types**: every schema referenced via `$ref` from those endpoints, resolved recursively under `components.schemas` (OpenAPI 3) or `definitions` (Swagger 2).
    -   **Enums**: `enum` values on schemas and properties.
    -   **Optionality**: `required` arrays and `nullable` flags.
-   If an endpoint has no typed response, or a `$ref` does not resolve, list the gaps and ask the user. Do not fill them in.

### 3. Map and Compare with Frontend
-   Locate the corresponding frontend module in `src/app/pages/[module]/`.
-   Read the existing frontend files in `model/` and `services/`.
-   **Perform a Side-by-Side Comparison**: Map every backend property (from the MCP- or Swagger-provided structure) to the frontend interface. Look for:
    -   New properties/columns.
    -   Changed types (e.g., `string` to `enum`).
    -   Modified optionality (e.g., `nullable: true`).
    -   New or renamed controller endpoints.

### 4. Synchronize Models
-   Update or create TypeScript interfaces in the frontend module's `model/` directory.
-   **Rule: One file per entity.** (e.g., `workflow-template.model.ts`).
-   Include Enums: Always define the same enums (e.g., `WorkflowTemplateScope`) in the frontend model if they exist in the backend entity.

### 5. Synchronize API Services
-   Update or create the dedicated service in the frontend module's `services/` directory.
-   **Rule: One service per controller** (Swagger: one service per tag).
-   Implement methods matching the backend controller's endpoints (`Get`, `Post`, `Patch`, `Delete`).
-   Use the environment base-path key of the target service from the service map (step 1). Never hardcode the base URL.

### 6. Final Verification
-   **Proxy Check**: Ensure the project's proxy config routes the new endpoints to the target service.
-   **Type Safety**: Run `npm run lint` or `tsc` if possible to ensure no regressions.

## Guidelines

-   **Signals First**: Use Signal-based APIs (`toSignal`, `signal`, `computed`) in components.
-   **Strict Typing**: Frontend interfaces must exactly match the backend definitions from the source of truth (MCP `get_type_definition` output or the Swagger schema).
-   **No Hallucinations**: Never assume a property exists. Only add properties explicitly listed in the source of truth.
-   **Check for Enums**: Backend entities often use Enums (e.g., `scope`). Ensure these are mirrored in the frontend model files.
-   Refer to [backend-mapping.md](references/backend-mapping.md) for service discovery and network details.
-   Module layout follows `dev-angular-module-architecture`; entity/service split follows `dev-angular-back-nestjs`.
