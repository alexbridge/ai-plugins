---
name: dev-nestjs-exceptions
description: Exception handling in NestJS services — native @nestjs/common exceptions only, no-arg throws, a global HttpExceptionFilter that owns the response envelope, and exception-class choice on public auth endpoints (no method hints). Use when throwing HTTP errors, adding or reviewing an exception filter, changing the error response shape, or hardening login/credential endpoints.
---

# NestJS Exceptions

Native exceptions, one global filter per service, exception class as the only wire-level signal.

## Project Discovery

Before writing code, find:

| Item | How to find | Reference |
|------|-------------|-----------|
| Global exception filter | grep `@Catch(HttpException)`, `implements ExceptionFilter`, `useGlobalFilters`, `APP_FILTER` | `src/modules/api-common/filter/exception-filters.ts` → `HttpExceptionFilter` |
| Envelope shape | read the filter's `response.json(...)` call | see Rule 3 |
| `message` source | does the filter emit `exception.name` or `exception.message`? | `exception.name` |

- If the project has **no** global filter, STOP and ask the user whether to introduce one. Do not add per-controller filters.
- If the filter emits `exception.message` (not `exception.name`), the "no-arg" rule below does not apply as written — confirm with the user which messages may reach the client.

## Rules

### 1. Native exceptions only

Throw the `HttpException` subclasses from `@nestjs/common`: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `InternalServerErrorException`, etc.

- Custom subclasses (`class InvalidCredentialsException extends UnauthorizedException`) are forbidden. They add indirection and break envelope uniformity.

```typescript
// good
throw new UnauthorizedException();
throw new NotFoundException();
throw new ConflictException();

// bad — custom subclass
export class InvalidCredentialsException extends UnauthorizedException {}
throw new InvalidCredentialsException();
```

### 2. No constructor argument

When the filter emits `exception.name` as `message`, `throw new UnauthorizedException('Invalid credentials')` and `throw new UnauthorizedException()` produce identical bodies. The string is discarded and only misleads readers — pass no argument.

### 3. The filter owns the envelope

Reference envelope:

```json
{
  "statusCode": 401,
  "timestamp": "2026-05-15T12:34:56.789Z",
  "path": "/auth/authenticator/login",
  "message": "UnauthorizedException",
  "errors": null
}
```

- `message` is the exception class name. `errors` carries `ValidationPipe` details, otherwise `null`.
- To change the shape (add a field, drop `path`), edit the global filter — **one place per service**. Never thread messages per call site.
- Multi-service repos: every service registers its own copy; keep the copies in sync.

### 4. Choose the class by wire intent

The class is the only lever that differentiates responses.

| Situation | Class |
|-----------|-------|
| Missing / invalid / expired credentials | `UnauthorizedException` |
| Authenticated but lacks a required claim (e.g. no tenant) | `ForbiddenException` |
| Entity missing **or** owned by another tenant/user | `NotFoundException` (no enumeration leak) |
| Unique-constraint / state conflict | `ConflictException` |
| Malformed input | `ValidationPipe` (DTO + class-validator) — not hand-thrown |

### 5. Public auth endpoints — no method hints

- Every credential failure throws `UnauthorizedException`, uniformly.
- Never throw `BadRequestException` from a credential-evaluation path: `"BadRequestException"` vs `"UnauthorizedException"` tells a probe "your shape was wrong" vs "your credentials were wrong".
- Input-shape errors belong to `ValidationPipe`, which runs before the controller method and before any credential comparison.

## Checklist

- [ ] Only `@nestjs/common` exception classes; no custom subclasses.
- [ ] No string arguments (when the filter emits `exception.name`).
- [ ] Cross-tenant / cross-user → `NotFoundException`, never `ForbiddenException` with a hint.
- [ ] Auth endpoints throw only `UnauthorizedException` on credential paths.
- [ ] Envelope changes made in the global filter, in every service.
