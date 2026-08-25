# 06 - Advanced EF Core Patterns & High-Performance Data Access

## 1. Bulk Operations: `ExecuteUpdateAsync()` & `ExecuteDeleteAsync()`

Prior to EF Core 7+, updating or deleting 10,000 rows required:
1. Loading all 10,000 rows into memory (`SELECT`).
2. Mutating properties on each C# object.
3. Calling `SaveChangesAsync()` to generate 10,000 individual `UPDATE` statements.

In modern **EF Core 8/9/10**, bulk operations execute **directly on the database in a single SQL statement** without allocating entities or tracking them in memory!

```mermaid
graph LR
    subgraph Traditional EF Core (Slow)
        T1["SELECT 10,000 rows into RAM"] --> T2["Change Tracker mutates 10k entities"] --> T3["10,000 UPDATE roundtrips"]
    end

    subgraph Modern ExecuteUpdate (Blazing Fast)
        M1["ExecuteUpdateAsync()"] --> M2["Single Direct SQL: UPDATE Products SET Price = Price * 1.1 WHERE Category = 'Laptops'"]
    end
```

```csharp
// 🚀 1. Bulk Update in a single database roundtrip:
await context.Products
    .Where(p => p.Category == "Laptops" && p.StockQuantity > 0)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(p => p.Price, p => p.Price * 1.10m)
        .SetProperty(p => p.LastModifiedAtUtc, DateTime.UtcNow));

// 🚀 2. Bulk Delete expired tokens in a single database roundtrip:
await context.Set<IdempotentRecord>()
    .Where(r => r.ExpiresAtUtc < DateTime.UtcNow)
    .ExecuteDeleteAsync();
```

---

## 2. Raw SQL Queries & Type-Safe Interoperability

When complex analytics or database-specific functions are required:

### Querying Unmapped DTOs with `SqlQuery<T>`:
```csharp
public record CategorySalesSummary(string Category, decimal TotalRevenue, int TotalItemsSold);

var salesReport = await context.Database
    .SqlQuery<CategorySalesSummary>($@"
        SELECT
            p.Category,
            SUM(p.Price * oi.Quantity) AS TotalRevenue,
            SUM(oi.Quantity) AS TotalItemsSold
        FROM Products p
        INNER JOIN OrderItems oi ON p.Id = oi.ProductId
        GROUP BY p.Category")
    .ToListAsync();
```

---

## 3. Automatic Entity Auditing with DbContext Interceptors

In Clean Architecture, entities inherit from a base auditing class (`BaseAuditableEntity`). Instead of manually setting `CreatedAtUtc` and `CreatedBy` in every handler, wire up an **EF Core SaveChanges Interceptor**:

```csharp
public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditableEntityInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var userId = _currentUserService.UserId ?? "System";
        var utcNow = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<BaseAuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = utcNow;
                entry.Entity.CreatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModifiedAtUtc = utcNow;
                entry.Entity.LastModifiedBy = userId;
            }
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }
}
```

---

## 4. High-Throughput Performance: `DbContext Pooling`

Creating a new `DbContext` instance on every HTTP request involves reflection, options validation, and internal service provider resolution.

```csharp
// In DependencyInjection.cs:
// Reuses DbContext instances from an internal pool like connection pooling!
builder.Services.AddDbContextPool<AppDbContext>(options =>
{
    options.UseSqlite(connectionString);
}, poolSize: 1024);
```
> [!TIP]
> **Performance Gain**: DbContext Pooling can increase API throughput by **15% to 25%** under heavy concurrent load by eliminating GC allocation churn!

---

## 5. Temporal Tables (System-Versioned Audit Logs)

In SQL Server and PostgreSQL, **Temporal Tables** record the complete history of every row change automatically in a hidden shadow table.

```csharp
// Enabling Temporal Tables in EF Core:
modelBuilder.Entity<Customer>()
    .ToTable("Customers", b => b.IsTemporal());

// Querying data as it existed at a point in the past:
var historicalCustomer = await context.Customers
    .TemporalAsOf(DateTime.UtcNow.AddMonths(-3))
    .FirstOrDefaultAsync(c => c.Id == customerId);
```
