---
name: dev-angular-module-architecture
description: Implementation and management of self-contained, portable Angular modules. Use when creating new features or refactoring existing ones into domain-driven standalone modules.
---

# Angular Module Architecture

Domain-driven, portable module architecture for Angular projects. Keeps features consistent, maintainable, and easy to move or refactor.

## Core Workflow

1. **Analyze**: Determine the domain boundaries for the new feature or refactoring task.
2. **Structure**: Create the module directory in `src/app/pages/` following the layout in [structure.md](references/structure.md).
3. **Implement**: Build components, services, and routes per `dev-angular-coding-standards`; reusable UI per `dev-angular-ui-patterns`.

## Module Layout

Modules in `src/app/pages/` are self-contained and portable. Each module folder contains:

- **[module].routes.ts**: Routes for the module.
- **/pages**: Full-page components (e.g., Login, Register).
- **/components**: Reusable UI components specific to the module's domain.
- **/services**: Business logic and data services.
- **/model**: Interfaces, types, and API response models.
- **/http**: HTTP-specific logic, such as interceptors or specialized clients.
- **/guards**: Route guards specific to the module.

Full tree and principles: [structure.md](references/structure.md).

## Guidelines

- **Always** place domain-specific logic inside the module.
- **Prefer** `src/app/shared` for truly cross-cutting UI components.
- **Prefer** `src/app/core` for global singleton services.
- **Ensure** the `[module-name].routes.ts` file exports a `Routes` array compatible with Angular's lazy loading.
