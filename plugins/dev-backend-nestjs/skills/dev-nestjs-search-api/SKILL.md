---
name: dev-nestjs-search-api
description: Standard pattern for advanced search with pagination and filtering in NestJS — generic search service base class, public vs internal filter DTOs, sorted pagination DTO, POST /search endpoint. Use when adding or changing a search/list endpoint.
---

# Search API Pattern

Standardized pattern for advanced search with pagination and filtering in NestJS controllers and services (TypeORM).

## Project Discovery

Class names below are the reference convention. Find the project's equivalents first:

| Role | Reference name |
|------|----------------|
| Generic search service base | `SearchService<T>` (`search(pagination, filters)`) |
| Filter contract | `SearchFilters<T>` (`getSearchFilters(): SearchFilter<T>[][]`) |
| Filter item + rule enum | `SearchFilter`, `SearchFilterRule` (`LIKE`, `EQUALS`, ...) |
| Pagination base | `SortedPagination` (`offset`, `limit`, `orderBy`, `sortOrder`) |
| Validation helper | `@IsNotBlank()` (custom `class-validator` decorator) |

If the base classes do not exist, STOP and ask the user whether to introduce them (shared/common library) or follow another existing search approach.

## Core Components

### 1. Service: Extend the search base
Every domain search service extends the generic search base to inherit the search logic.

```typescript
@Injectable()
export class DomainEntitySearchService extends SearchService<Entity> {
  constructor(
    @InjectRepository(Entity)
    protected readonly repository: Repository<Entity>,
  ) {
    super(repository);
  }
}
```

### 2. DTOs: Filter Implementation

#### Public Filters (`EntityFilters`)
Fields exposed to the API. Implements the filter contract and uses `class-validator` for validation.

```typescript
export class EntityFilters implements SearchFilters<Entity> {
  @IsOptional()
  @IsNotBlank()
  query: string;

  getSearchFilters(): SearchFilter<Entity>[][] {
    const commonFilters = this.getCommonFilters();
    if (!this.query) return [commonFilters];

    // OR logic: (field1 LIKE query AND common) OR (field2 LIKE query AND common)
    return [
      [new SearchFilter('field1', SearchFilterRule.LIKE, this.query), ...commonFilters],
      [new SearchFilter('field2', SearchFilterRule.LIKE, this.query), ...commonFilters],
    ];
  }

  getCommonFilters(): SearchFilter<Entity>[] {
    // Shared AND filters
    return [];
  }
}
```

#### Internal Filters (`EntityInternalFilters`)
Extends public filters with mandatory internal constraints (e.g., `tenantId`). Never exposed as a request body type.

```typescript
export class EntityInternalFilters extends EntityFilters {
  tenantId: number;

  getCommonFilters(): SearchFilter<Entity>[] {
    return [
      ...super.getCommonFilters(),
      new SearchFilter('tenantId', SearchFilterRule.EQUALS, this.tenantId),
    ];
  }
}
```

#### Pagination DTO
Extends the pagination base; whitelists sortable columns.

```typescript
export class EntityPagination extends SortedPagination {
  @IsOptional()
  @IsIn(['id', 'createdAt', 'fullName'])
  public orderBy = 'createdAt';
}
```

### 3. Controller: `POST /search`
Pagination via `@Query`, filters via `@Body`. Internal constraints come from the authenticated principal — the auth strategy already resolved `tenantId` on `request.user` (see `dev-nestjs-api-jwt-guards`); no extra tenant lookup in the controller.

```typescript
@Post('/search')
async search(
  @Principal() user: AuthPrincipal,
  @Query() pagination: EntityPagination,
  @Body() request: EntityFilters,
) {
  const filters = Object.assign(new EntityInternalFilters(), request);
  filters.tenantId = user.tenantId; // set AFTER assign so the body cannot override it

  return this.entitySearchService.search(pagination, filters);
}
```

## Key Principles
1. **Separation of Concerns**: Keep public DTOs separate from internal enforcement filters.
2. **Validation**: `@Query` for pagination (URL params), `@Body` for complex filters (JSON).
3. **Internal Enforcement**: Apply security constraints (like `tenantId`) in the internal filters class, set after copying the request body.
4. **Generic Search**: Leverage the base `search()` to build TypeORM `FindOptions`.
