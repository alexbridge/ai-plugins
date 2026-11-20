---
name: dev-angular-back-nestjs
description: Architectural rules for porting NestJS modules to Angular frontend. Enforces entity-specific separation for models and services to maintain modularity and prevent monolithic files.
---

# Angular ← NestJS Module Porting

Standards for porting NestJS backend modules into the Angular frontend. Keeps entity-based separation in the frontend domain modules (layout per `dev-angular-module-architecture`).

## Architectural Principles

1.  **Entity-Service Parity**: Every controller/entity in the NestJS backend must map to a dedicated service in the Angular frontend.
    -   **Bad**: `user-webhook.service.ts` containing logic for endpoints, destinations, and payloads.
    -   **Good**: `webhook-endpoint.service.ts`, `webhook-destination.service.ts`, `webhook-payload.service.ts`.

2.  **Entity-Model Parity**: Every DTO or Entity in the backend must map to a dedicated TypeScript file in the frontend.
    -   **Bad**: `user-webhook.model.ts` containing 10+ interface definitions.
    -   **Good**: `webhook-endpoint.model.ts`, `webhook-destination.model.ts`.

3.  **Encapsulation**: Domain-specific logic should stay within the domain module's `services/` and `model/` folders.

## Workflow

1.  **Analyze Backend Structure**: Identify the controllers and entities in `../backend/app/src/modules/[module]/`.
2.  **Plan Frontend Files**: For each controller and its associated DTOs, define a matching service and model file in the frontend.
3.  **Implementation**:
    -   Create `src/app/pages/[module]/model/[entity].model.ts`.
    -   Create `src/app/pages/[module]/services/[entity].service.ts`.
4.  **Legacy Support (Optional)**: If existing code depends on a monolithic file name, convert it into a "barrel" file that re-exports the individual entity files and provides a compatibility wrapper.

## Guidelines

-   **Avoid Monoliths**: Never create a single service for an entire NestJS module if it contains multiple controllers.
-   **Consistent Naming**: Follow the backend's naming convention for endpoints and services.
-   **Strict Typing**: Ensure frontend interfaces exactly match backend DTOs.
