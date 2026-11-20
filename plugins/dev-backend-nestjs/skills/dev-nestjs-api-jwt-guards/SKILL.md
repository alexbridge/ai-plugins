---
name: dev-nestjs-api-jwt-guards
description: Guidance on protecting NestJS controllers and methods with JWT authentication, role-based (RBAC) guards, entity-resolving pipes, and multi-tenant ownership pipes. Use when adding security to API endpoints or enforcing that a path-param entity belongs to the caller's tenant/user.
---

# NestJS API JWT Guards

Authentication, role-based access control, and ownership checks for NestJS controllers.

## Project Discovery

Class names below are the reference convention. Before writing code, find the project's equivalents (grep for `CanActivate`, `PipeTransform`, `SetMetadata`, `AuthGuard(`):

| Role | Reference name |
|------|----------------|
| Authentication guard (validates JWT `Authorization: Bearer <token>`) | `AuthJwtGuard` |
| Role guard (checks principal roles/groups) | `UserGroupGuard` |
| Role decorator (declares required roles) | `@UserGroup(...)` |
| Role enum | `AuthRole` |
| Principal param decorator | `@Principal()` |
| Entity-resolving pipe (path-param → entity) | `FindOneEntityPipe(property)` |
| Tenant ownership pipe (numeric tenant id) | `TenantIdOwnerGuardPipe` + `TenantIdAware` |
| Tenant ownership pipe (tenant uid) | `TenantUidOwnerGuardPipe` |
| User ownership pipe | `UserIdOwnerGuardPipe` + `UserIdAware` |
| Module exporting the guards | `JwtClientModule` |

- Use the project's names and import paths. Never import the reference names blindly.
- If a building block is missing, STOP and ask the user whether to introduce it. Do not hand-roll a substitute inline in a controller.

## Implementation Patterns

### Protecting a Whole Controller

For entities that require a baseline permission level for all actions (e.g., system configuration).

```typescript
@Controller("/restricted-resource")
@UseGuards(AuthJwtGuard, UserGroupGuard)
@UserGroup(AuthRole.SUPER_ADMIN)
export class MyController {
  // All methods are protected and require SUPER_ADMIN role
}
```

### Protecting Specific Methods

For resources with mixed access levels.

```typescript
@Controller('/resources')
@UseGuards(AuthJwtGuard, UserGroupGuard)
export class MyController {

  @Get() // Just needs authentication
  async list() { ... }

  @Post()
  @UserGroup(AuthRole.ADMIN) // Needs ADMIN role
  async create() { ... }
}
```

### Module Dependencies

The API module using the guards imports the module that exports them.

```typescript
@Module({
  imports: [JwtClientModule, ...],
  controllers: [...],
})
export class MyApiModule {}
```

### Entity Resolution via Pipe

Resolve path-param entities with the entity-resolving pipe instead of manual lookup + `NotFoundException` in every method.

**Before (Manual Lookup):**

```typescript
@Get('/:uid')
async findOne(@Param('uid') uid: string) {
  const tenant = await this.tenantService.findOneByUid(uid);
  if (!tenant) throw new NotFoundException();
  return tenant;
}
```

**After (Pipe-based Injection):**

```typescript
@Get('/:uid')
async findOne(@Param('uid', FindOneEntityPipe('uid')) tenant: TenantEntity) {
  return tenant;
}
```

## Multi-Tenant Ownership

Applies when the project is multi-tenant. Every JWT-authenticated controller that accepts an entity uid as a path-param MUST enforce **tenant ownership** of that entity.

- Cross-tenant access surfaces as `NotFoundException` (same envelope as a genuinely missing entity) — never `ForbiddenException` with a "different tenant" hint, because that leaks existence to a probe.
- The check is enforced by a request-scoped pipe on the path-param, not by hand-rolled boilerplate in the controller body.
- The auth strategy (`validate()` of the Passport JWT strategy) resolves the JWT tenant claim into a numeric `tenantId` once per request and attaches it to `request.user`. **The pipe is in-memory** — no DB lookup. If the project's strategy does not attach `tenantId`, STOP and ask the user before adding it.
- Use the numeric-id pipe (`TenantIdOwnerGuardPipe`) for any entity with a `tenant_id` column. Use the uid variant (`TenantUidOwnerGuardPipe`) only when the resolved entity exposes `tenantUid` instead (e.g. the tenant entity itself).
- Every entity reachable by a JWT-guarded controller is either **tenant-scoped** (implements a tenant marker interface) or **explicitly global** (e.g. a cross-tenant `USER` identity table). No third state.
- Junction rows keyed by a tenant-scoped parent (e.g. `tenant_user_id`, `tenant_group_id`) implement no marker; guard the parent's path-param.
- Exceptions are no-arg native classes — see `dev-nestjs-exceptions`.

### Canonical pattern

```typescript
@Controller("/users/:tenantUserUid/authenticator")
@UseGuards(AuthJwtGuard, UserGroupGuard)
@UserGroup(AuthRole.ADMIN, AuthRole.MANAGER)
export class TenantUserAuthenticatorAdminController {
  constructor(
    private readonly authenticatorService: DomainTenantUserAuthenticatorService,
  ) {}

  @Post("/enroll")
  async enroll(
    @Param("tenantUserUid", FindOneEntityPipe("uid"), TenantIdOwnerGuardPipe)
    tenantUser: TenantUserEntity, // pipe rejects cross-tenant target with NotFoundException
  ): Promise<TenantUserAuthenticatorEnrollResponseDto> {
    // controller body is one domain-service call — no hand-rolled tenant check
    return await this.authenticatorService.enroll(tenantUser.id);
  }
}
```

Key shape:

- `@Param` chains three pipes in order: name-binding → entity resolution → ownership check.
- No `@Principal() user`, no `getTenant(user)` helper, no tenant-service injection — the pipe reads `request.user.tenantId` (already resolved by the strategy) and compares it against `entity.tenantId` in memory.
- The controller body shrinks to a single domain-service call.

### Anti-pattern — do NOT do this

```typescript
private async getTenant(user: AuthPrincipal): Promise<TenantEntity> {
  if (!user.tenantUid) throw new UnauthorizedException('User is not associated with any tenant'); // ❌ string arg
  const tenant = await this.tenantService.findOneByUid(user.tenantUid);
  if (!tenant) throw new UnauthorizedException('Associated tenant not found');                    // ❌ string arg
  return tenant;
}

@Post('/enroll')
async enroll(
  @Principal() user: AuthPrincipal,
  @Param('tenantUserUid', FindOneEntityPipe('uid')) tenantUser: TenantUserEntity,
) {
  const tenant = await this.getTenant(user);
  if (tenantUser.tenantId !== tenant.id) {
    throw new NotFoundException(`Tenant user with UID ${tenantUser.uid} not found in your tenant`); // ❌ string arg, ❌ inline
  }
  // ... mutation
}
```

What is wrong, in order of severity:

1. **String arguments may be silently discarded**. Check the project's global exception filter: if it overwrites the response body (e.g. emits `exception.name` as `message`), message strings never reach the client and only mislead readers. In that case throw no-arg exceptions.
2. **Redundant DB lookup**. The strategy already resolved the tenant once per request. A `getTenant(user)` helper repeats the same query at every call. The pipe reads `request.user.tenantId` directly.
3. **Inline check is duplicated, forgettable, drifts**. The same lines get copied across controllers, and a future author can forget them with no compiler warning. The pipe annotation is a single token on the path-param; a missing pipe stands out in review.
4. **Wrong exception class for "no tenant claim"**. `UnauthorizedException` means "you are not authenticated". A principal that passed the auth guard IS authenticated — it just lacks tenant context. Correct class: `ForbiddenException` (no arg). Conflating the two hides "send me your JWT" vs "your JWT lacks a required claim" from clients.

### Adding a new multi-tenant entity (step-by-step)

1. **Entity**: declare `@Column({ name: 'tenant_id' }) tenantId: number` on the entity; implement the project's tenant marker interface (reference: `TenantIdAware`). Index `(tenant_id, ...)` for every column queried alongside `tenant_id`.
2. **Domain service**: scope all `findOne*` / `findAll*` methods to a `tenantId` parameter — never accept a uid-only lookup that could leak across tenants. Repository queries always carry `WHERE tenant_id = ?`.
3. **Controller**: resolve the entity via `@Param('uid', FindOneEntityPipe('uid'), TenantIdOwnerGuardPipe) entity: MyEntity`. The pipe rejects cross-tenant targets with `NotFoundException` before the method body runs.
4. **No hand-rolled check**: no `getTenant(user)` helper, no `entity.tenantId` compare in the controller body, no `@Principal() user` parameter "just to be safe".
5. **REST verification**: the `.rest` file (per `dev-nestjs-rest-manager`) includes three samples per endpoint — success (`200`/`204`), `403 ForbiddenException` (JWT without tenant claim), `404 NotFoundException` (cross-tenant target: a uid owned by a different tenant in the seed data).

### Migrating an existing controller

Use when porting a controller off the inline `getTenant + tenantId compare` pattern:

1. Confirm the resolved entity implements the tenant marker interface. If not (e.g. a junction row with `tenant_user_id`), guard the **parent** entity's path-param instead.
2. Replace `@Param('xUid', FindOneEntityPipe('uid'))` with `@Param('xUid', FindOneEntityPipe('uid'), TenantIdOwnerGuardPipe)` on every method with a tenant-scoped path-param.
3. Drop the `@Principal() user` parameter where used only for the tenant check, drop the `getTenant(user)` helper, drop the tenant-service injection — but keep them if other methods (e.g. `create`/`search`/`findAll` without path-param) still need the tenant id for scoping.
4. Update the matching `.rest` file with three-path coverage (success / 403 / 404).
5. Run the project's build (e.g. `npm run build`) and verify exit 0. Add or update tests per the project's test policy.

### Variant — uid-based tenant pipe

Use only when the resolved entity exposes `tenantUid: string` rather than `tenantId: number` — typically when the path-param resolves to the tenant entity itself. Same contract: pass through on match, no-arg `ForbiddenException` when the principal has no tenant claim, no-arg `NotFoundException` on cross-tenant mismatch. Default to the numeric pipe; justify any deviation in code review.

## Best Practices

- **Controller-level protection**: Prefer the auth guard at controller level for consistency.
- **Specific roles**: Always use the role enum instead of hardcoded strings.
- **Pipes**: Combine guards with the entity-resolving pipe for cleaner controllers.
- **Multi-tenant entities**: Always chain the tenant ownership pipe after the entity-resolving pipe — never enforce tenant ownership inline in the controller body.
- **User-owned entities**: Same pattern with the user ownership pipe (`request.user.id === entity.userId`).
