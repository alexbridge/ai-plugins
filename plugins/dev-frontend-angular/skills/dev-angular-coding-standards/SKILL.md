---
name: dev-angular-coding-standards
description: Angular 19+ coding standards — signals over observables, function-based input()/output()/model(), native control flow (@if/@for/@switch), standalone + OnPush components, inject(), host metadata, @defer, Tailwind utility-first styling. Use when writing, generating, or reviewing any Angular component, directive, pipe, service, or template.
---

# Angular Coding Standards (v19+)

Modern, signal-first Angular. Applies to every component, directive, pipe, and service.

## Project Discovery

- Check the Angular version in `package.json` (`@angular/core`). Rules assume v19+. On an older version, STOP and ask which rules apply.
- Check formatter/linter config (`.prettierrc*`, `eslint.config.*`, `angular.json` lint target). Format with what the project has. Do not add a linter or `lint` script the project does not already use.
- Check Tailwind version (`tailwindcss` in `package.json`, `@theme` in global CSS → v4).

## State: Signals over Observables

- `signal()`, `computed()`, `effect()` for local and shared state.
- No `BehaviorSubject` unless a legacy library requires it.
- `toSignal()` for read-only streams from services/HTTP. When a library exposes RxJS, wrap it with `toSignal` at the boundary.

## Inputs, Outputs, Two-Way Binding

- Inputs: `input()` / `input.required()` — never `@Input()`.
- Outputs: `output()` — never `@Output()` + `EventEmitter`.
- Two-way: `model()`.
- Why: `computed()`/`effect()` that read inputs are only reactive when inputs are signals.

## Templates: Native Control Flow

- `@if`, `@for` (with `track`), `@switch`, `@empty`.
- Never `*ngIf`, `*ngFor`, `*ngSwitch`.
- Dynamic classes via signal bindings: `[class.bg-blue-500]="isActive()"`.

## Components

- Standalone only (components, directives, pipes). No NgModules.
- `changeDetection: ChangeDetectionStrategy.OnPush`.
- `host: { ... }` in `@Component` — not `@HostBinding` / `@HostListener`.
- `inject(MyService)` — not constructor injection.
- `@defer` for heavy blocks (charts, complex modals).

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (user(); as u) {
      <h3 [class.text-gray-400]="!u.active">{{ u.name }}</h3>
    } @else {
      <p>No user</p>
    }
  `,
})
export class UserCardComponent {
  private readonly users = inject(UserService);
  readonly userUid = input.required<string>();
  readonly selected = output<string>();
  readonly user = computed(() => this.users.byUid(this.userUid()));
}
```

## Styling: Tailwind

- Utility-first. No per-component CSS files unless a utility cannot express it.
- Custom theme tokens go in `@theme` (v4) / `tailwind.config` (v3).
- Mobile-first breakpoints (`md:`, `lg:`) for every layout, especially sidebars and tables.
- Admin/data tables are wrapped in `overflow-x-auto`.
- Dark mode via `dark:` variants.

## Review Checklist

- [ ] No `@Input`/`@Output`/`EventEmitter`/`@HostBinding`.
- [ ] No `*ngIf`/`*ngFor`/`*ngSwitch`.
- [ ] `OnPush` + standalone.
- [ ] No `BehaviorSubject` for component state.
- [ ] Tables responsive (`overflow-x-auto`), layouts mobile-first.

Related: `dev-angular-ui-patterns` (icons, dialogs, row actions), `dev-angular-module-architecture` (where files go).
