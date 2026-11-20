---
name: dev-nestjs-module-architect
description: Create new feature-based NestJS modules (or refactor existing ones) following the API/Domain/Services/Config layered architecture, step by step from requirements to root-module integration. Also diagnose and fix dependency injection errors ('Nest can't resolve dependencies') and enforce modular architecture.
---

# NestJS Module Architect

## Overview

Guides creation of NestJS modules in a feature-based layered architecture (API/Domain/Services/Config), and debugging of dependency injection errors. Use when creating or refactoring modules, or when resolving "Nest can't resolve dependencies" errors.

## Project Discovery

Paths below are the reference convention. Before creating files, confirm against the current project:

- **Modules root**: where feature modules live (reference: `src/modules/`). Find via existing `*.module.ts` files.
- **Root module**: the module that imports feature modules (reference: `src/app.module.ts`).
- **Existing layout**: open one existing feature module. If it deviates from the reference layout, follow the project and tell the user about the deviation.
- If the project has no feature modules yet, STOP and confirm the layout with the user before creating the first one.

## Workflow: Creating or Refactoring Modules

See [references/module-structure.md](references/module-structure.md) for the full folder layout and rules.

1.  **Understand Requirements**:
    - Define the new feature's purpose and core entities.
    - Identify required API endpoints and configuration needs.

2.  **Create Module Structure**:
    - Create the base folder: `<modules-root>/{module-name}`.
    - Create subfolders: `api/`, `domain/`, `services/`, `config/`.

3.  **Define Domain Layer**:
    - Create entities in `domain/entities/`.
    - Create domain services in `domain/services/`.
    - Create a `domain/{module-name}-domain.module.ts` to encapsulate persistence logic.

4.  **Define API Layer**:
    - Create controllers in `api/controller/`.
    - Create API DTOs in `api/dto/`.
    - Create an `api/{module-name}-api.module.ts` to encapsulate external interfaces.

5.  **Define Config Layer**:
    - Create configuration mapping in `config/`.
    - Create a `config/{module-name}-config.module.ts`.

6.  **Create Main Module File**:
    - Create `<modules-root>/{module-name}/{module-name}.module.ts`.
    - Import and export the internal layer modules (`ApiModule`, `DomainModule`, etc.).

7.  **Integrate with App**:
    - Add the new feature module to the root module.

8.  **Validate Structure**: Run the validation script from the backend project root.

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/dev-nestjs-module-architect/scripts/validate_module_structure.cjs" <module-name> [modules-root]
```

`modules-root` defaults to `src/modules`.

## Workflow: Debugging Dependency Errors

When encountering a "Nest can't resolve dependencies" error:

1.  **Identify the Missing Provider:** The error names the missing provider (e.g., `AuthJwtConfigService`) and the consumer module (e.g., `UserModule`).
2.  **Check for Manual Provision:** The provider must NOT be added to the `providers` array of the consuming module if it belongs to another module.
    *   *Bad:* `providers: [AuthJwtService]` (in UserModule)
    *   *Good:* `imports: [AuthJwtModule]` (in UserModule)
3.  **Check Exports:** The module that *owns* the provider exports it.
    *   *Check:* `exports: [AuthJwtService]` (in AuthJwtModule)
4.  **Check Imports:** The consuming module imports the owning module.
    *   *Check:* `imports: [AuthJwtModule]` (in UserModule)
5.  **Check Circular Dependencies:** If modules import each other, use `forwardRef(() => ModuleName)`.

## References

- **Module Structure Guide:** [references/module-structure.md](references/module-structure.md).
- **Entities:** `dev-nestjs-typeorm`.
