# Angular Domain-Driven Module Structure

This document defines the standard for self-contained, portable Angular modules used across Angular projects.

## Directory Layout

Each module located in `src/app/pages/` must follow this structure:

```text
[module-name]/
├── [module-name].routes.ts    # Route definitions using modern Angular syntax
├── pages/                    # Full-page components
│   └── [page-name]/
│       ├── [page-name].component.ts
│       ├── [page-name].component.html
│       └── [page-name].component.css (optional)
├── components/               # Reusable UI components specific to this domain
├── services/                 # Domain-specific business logic services
├── model/                    # Interfaces, types, and API response models
├── http/                     # HTTP-specific logic (interceptors, clients)
└── guards/                   # Route guards specific to this module
```

## Principles

1. **Standalone Components**: All components MUST be standalone.
2. **Signals Mandatory**: Use Signals for all state management.
3. **Modern Control Flow**: Use `@if`, `@for`, `@switch`.
4. **Portability**: The module should have minimal external dependencies outside of `core` and `shared`.
5. **Routes**: The `[module-name].routes.ts` file should be the single entry point for routing into the module.
