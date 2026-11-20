# TypeORM Patterns

Common decorators and patterns. Column names via `name` (snake_case), table names per project convention.

## Basic Column

```typescript
@Column({ name: 'display_name', length: 255, nullable: true })
displayName: string | null;
```

## Numeric Column

```typescript
@Column({ type: 'decimal', precision: 10, scale: 2, name: 'price' })
price: number;
```

## JSON Column

```typescript
@Column({ type: 'json' })
data: MyJsonObject;
```

## Relationships

### Many-To-One / One-To-Many

```typescript
// In OrderEntity
@ManyToOne(() => UserEntity, (user) => user.orders)
@JoinColumn({ name: 'user_id' })
user: UserEntity;

// In UserEntity
@OneToMany(() => OrderEntity, (order) => order.user)
orders: OrderEntity[];
```

### Many-To-Many

```typescript
@ManyToMany(() => TagEntity)
@JoinTable({
  name: 'PRODUCT_TAGS',
  joinColumn: { name: 'product_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
})
tags: TagEntity[];
```

## Indexes

```typescript
@Index('idx_user_email', ['email'], { unique: true })
@Column({ name: 'email' })
email: string;
```
