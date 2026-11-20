---
name: dev-angular-ui-patterns
description: Reusable UI patterns for Angular admin apps — shared components location, inline SVG icons as attribute-selector components, signal-based confirm/alert dialogs instead of window.confirm/alert/prompt, and per-row table actions as a kebab dropdown. Use when adding an icon, a confirmation or alert, table row actions, or any reusable UI element (button, card, form field, modal, table).
---

# Angular UI Patterns

Reuse before rewrite. One source of truth per icon, dialog, and row-action menu.

## Project Discovery

Reference paths below assume `src/app/shared/components/`. Find the project's equivalents first:

| Item | Reference path | How to find |
|------|----------------|-------------|
| Shared components root | `shared/components/` | `ls src/app/shared` |
| Icon components | `shared/components/icons/` | grep `selector: 'svg[icon-` |
| Modal primitive | `shared/components/ui/modal/` → `<app-modal>` | grep `selector: 'app-modal'` |
| Dialog layer | `shared/components/dialog/` → `<app-confirm-dialog>`, `DialogService` | grep `confirm-dialog`, `DialogService` |
| Row-action dropdown | `shared/components/common/table-dropdown/` → `<app-table-dropdown>` | grep `app-table-dropdown` |
| UI template library | e.g. TailAdmin demo components, picker MCP, project-local skill | check `.agents/skills/`, `.mcp.json` |

- If the project ships a UI template library (demo components, picker MCP, catalog skill), check it before building anything.
- If a building block is missing, STOP and ask whether to introduce it. Do not inline a one-off.

## Shared Components

Cross-cutting UI lives in the shared components root — not in a feature module:

- Buttons (primary, secondary, icon), dialogs/modals, cards/widgets, form fields/selectors/layouts, responsive tables.

Order: template library → shared components → new shared component. Never a feature-local copy of a generic element.

## Icons — No Raw `<svg>` in Templates

- Never paste `<path>`/`<circle>` markup into a `*.component.html`.
- Each icon is a standalone component with an **attribute selector** `svg[icon-<name>]`. It renders only inner shapes (`<svg:path>`, `<svg:circle>`); the caller owns the host `<svg>` (`class`, `width`, `height`, `viewBox`).
- Use `currentColor` so callers color via Tailwind (`text-*`, `fill-current`).
- Check `icons/` before adding. New file only when no equivalent exists: `icon-<name>.component.ts`.

```typescript
@Component({
  selector: 'svg[icon-pencil]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg:path fill="currentColor" d="M..." />`,
})
export class IconPencilComponent {}
```

```html
<svg icon-pencil class="fill-current" width="18" height="18" viewBox="0 0 18 18"></svg>
```

Why: duplicated inline SVG drifts (`viewBox`, `fill`, a11y attrs) and bloats templates.

## Dialogs — No Browser Prompts

- Never call `window.confirm()`, `window.alert()`, `window.prompt()`. They block the event loop, ignore styling and dark mode, and need special handling in E2E tests.
- Layering — keep separate:
  - **Modal primitive** (`<app-modal>`): backdrop, Esc, close button, `isOpen`/`close`. Wrap it, don't duplicate it.
  - **Template demo modals**: visual reference only. Never import from application code.
  - **Dialog layer** (`dialog/`): every confirm/alert/prompt replacement.
- Required variants: confirm (`title`, `body`, `confirmLabel`, `cancelLabel`, `variant` inputs; `confirmed`/`cancelled` outputs) and alert/info. Add an input dialog only for a real use case.
- Open via a service, host mounted once at app-shell level:

```typescript
private readonly dialog = inject(DialogService);

async remove(row: Holiday): Promise<void> {
  const ok = await this.dialog.confirm({ title: 'Delete holiday?', variant: 'danger' });
  if (ok) await this.holidays.remove(row.uid);
}
```

## Table Row Actions — Kebab Menu

- Per-row actions render in a dropdown (kebab/ellipsis), not inline buttons.
- Trigger glyph: `<svg icon-dots-vertical …>`.
- Destructive items (Delete/Cancel/Reject): red text **and** still confirm via the dialog — `variant: 'warning'` for cancel-style, `variant: 'danger'` for irreversible deletes.
- Single-action rows MAY use one inline button. Switch to the dropdown as soon as a second action is plausible.

```html
<td class="px-5 py-4 text-end">
  <app-table-dropdown>
    <button dropdown-button class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
      <svg icon-dots-vertical class="size-6" fill="currentColor" viewBox="0 0 24 24"></svg>
    </button>
    <div dropdown-content>
      <button (click)="openEditModal(row)" class="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 p-2">Edit</button>
      <button (click)="openDeleteModal(row)" class="flex w-full font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300 p-2">Delete</button>
    </div>
  </app-table-dropdown>
</td>
```

Why: narrow action columns, consistent UX across list pages, uniform Playwright locators (`getByRole('button', { name })` inside the opened menu).

## Review Checklist

- [ ] No raw `<svg>` shapes in templates; icons via `svg[icon-*]`.
- [ ] No `window.confirm/alert/prompt`.
- [ ] Demo/template modals not imported from app code.
- [ ] Multi-action rows use the dropdown; destructive items red + confirmed.

Related: `dev-angular-coding-standards`, `dev-angular-module-architecture`.
