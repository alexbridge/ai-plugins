# NestJS Module Architecture

## Overview

Reference convention: strict **feature-based modular architecture**. Each feature is a standalone NestJS module under the modules root (reference: `src/modules/`, e.g. `src/modules/user`). Follow the current project where it deviates.

## Folder Structure

Each module should have the following internal structure. **For modules managing multiple distinct entities or sub-domains, these layers must be further organized into dedicated sub-folders per entity group or sub-domain.**

```
src/modules/<feature-name>/
├── <feature-name>.module.ts       # Main module file, imports sub-modules
├── api/                           # External interface layer
│   ├── <feature>-api.module.ts    # API sub-module
│   ├── controller/                # Controllers (Organized by entity group)
│   │   └── <entity-group>/        # (e.g., template/, execution/)
│   ├── dto/                       # DTOs (Organized by entity group)
│   │   └── <entity-group>/        # (e.g., template/, execution/)
│   └── guard/                     # API-specific guards
├── domain/                        # Core business & persistence layer
│   ├── <feature>-domain.module.ts # Domain sub-module
│   ├── entities/                  # Entities (Organized by entity group)
│   │   └── <entity-group>/        # (e.g., template/, execution/)
│   ├── repository/                # Custom Repositories (if any)
│   └── services/                  # Domain services (Organized by entity group)
│       └── <entity-group>/        # (e.g., template/, execution/)
├── services/                      # Orchestration layer (optional)
│   └── <feature>.service.ts       # Coordinators between domain & external
└── config/                        # Configuration layer
    ├── <feature>-config.module.ts # Config sub-module
    └── services/                  # Config services
```

Example for `WORKFLOW_TEMPLATE`:
- `src/modules/workflow/domain/entities/template/workflow-template.entity.ts`
- `src/modules/workflow/api/controller/template/workflow-template.controller.ts`
- `src/modules/workflow/api/dto/template/workflow-template.dto.ts`
- `src/modules/workflow/domain/services/template/workflow-template.service.ts`

## Layers

- **API (`api/`)**: External interface — controllers and DTOs, organized by entity group.
- **Domain (`domain/`)**: Core business and persistence — entities and domain services, organized by entity group.
- **Services (`services/`)**: Orchestration across domain services and external integrations.
- **Config (`config/`)**: Module-specific configuration and environment variable mapping.

Example: `src/modules/user` contains its own `api/`, `domain/`, `services/`, and `config/` directories, all coordinated by `user.module.ts`.

## Rules

1.  **Encapsulation:** Modules should not import files deeply from other modules. Import the *module* itself.
2.  **Exports:** If a provider is needed by another module, export it from its owning module and import the owning module. **Do not add the provider to the `providers` array of the consuming module.**
3.  **Dependency Injection:** Always use dependency injection. Avoid `new Class()` for services.
4.  **Naming:** Use `PascalCase` for classes and `kebab-case` for file names.
5.  **Layer Encapsulation:** Each layer module exports only what other layers or modules need.
