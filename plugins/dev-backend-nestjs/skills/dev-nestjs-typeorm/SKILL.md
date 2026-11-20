---
name: dev-nestjs-typeorm
description: Create and manage TypeORM entities in a NestJS project. Use when the user wants to add, update, or refactor database models (entities, columns, relations, indexes).
---

# NestJS TypeORM Entities

Creation and management of TypeORM entities following project conventions.

## Project Discovery

Before creating an entity, read 2-3 existing entities and resolve:

- **Base classes**: shared entity base classes (reference: `DomainEntity<T>`, `DomainCreatedAtEntity<T>`, `DomainTimesEntity<T>` in a `common.entities.ts`). If none exist, use plain TypeORM decorators and ask before introducing base classes.
- **Table naming**: as used by existing `@Entity('...')` (reference: `UPPER_SNAKE_CASE`).
- **Location**: per module layout (reference: `<modules-root>/<module>/domain/entities/<entity-group>/<entity-name>.entity.ts`, see `dev-nestjs-module-architect`).
- **Migrations**: whether the project uses migrations or `synchronize`. If migrations, generate/write one per schema change with the project's script.

## Core Conventions (reference)

- **Base Classes**: entities extend one of the shared bases:
  - `DomainEntity<T>`: Basic entity with an `id` (PrimaryGeneratedColumn).
  - `DomainCreatedAtEntity<T>`: Includes `createdAt`.
  - `DomainTimesEntity<T>`: Includes `createdAt` and `updatedAt`.
- **Naming**:
  - Class name: `PascalCaseEntity` (e.g., `UserEntity`).
  - Table name: `UPPER_SNAKE_CASE` (e.g., `@Entity('USER_PROFILE')`).
  - Column name: `snake_case` in the database, `camelCase` in TypeScript (e.g., `@Column({ name: 'full_name' }) fullName: string;`).
- **Common Class**: the bases extend a `CommonClass<T>` allowing constructor-based initialization: `new UserEntity({ fullName: 'John' })`.

## Workflow

1. **Identify Module**: Determine which feature module the entity belongs to. Create the entity-group folder if necessary.
2. **Select Base Class**: Choose the base class by tracking requirements (id only / createdAt / createdAt + updatedAt).
3. **Define Entity**: Create the `.entity.ts` file with `@Entity` and the project's table-name convention. Start from [assets/entity-template.ts](assets/entity-template.ts) and fix the base-class import path.
4. **Add Columns**: Use `@Column`, `@Index`, and relationship decorators (`@OneToMany`, `@ManyToOne`, etc.). Always specify the `name` property for columns.
5. **Update Module**: Register the entity in the domain module via `TypeOrmModule.forFeature([NewEntity])`.
6. **Schema Change**: Add a migration if the project uses migrations.

## Examples and Patterns

See [references/typeorm-patterns.md](references/typeorm-patterns.md) for common decorators and relationship patterns.
