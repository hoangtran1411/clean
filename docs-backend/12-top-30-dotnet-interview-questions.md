# 12 - Top 30 .NET & ASP.NET Core Interview Questions (Easy, Medium, Advanced)

A curated compilation of 30 real-world interview questions with concise, high-impact model answers covering C#, ASP.NET Core (.NET 10), Clean Architecture, EF Core, Distributed Systems, and Security.

---

## 🟢 Category 1: Easy / Foundational (10 Questions)

### Q1. What is the difference between Value Types and Reference Types in C#?

- **Concept**: Memory allocation and copy behavior.
- **Key Answer**:
  - **Value Types** (e.g., `int`, `bool`, `struct`, `enum`, `DateTime`) store their data directly, typically allocated on the stack (or embedded within containing objects on the heap). Assigned by value (copying data).
  - **Reference Types** (e.g., `class`, `interface`, `string`, `record class`, `delegate`) store a memory pointer/reference pointing to the actual object on the managed heap. Assigned by reference.

### Q2. What are the three service lifetimes in ASP.NET Core Dependency Injection?

- **Concept**: IoC container lifecycle management.
- **Key Answer**:
  - **Transient** (`AddTransient`): Created each time they are requested. Ideal for lightweight, stateless services.
  - **Scoped** (`AddScoped`): Created once per HTTP request/scope. Ideal for `DbContext` and business services.
  - **Singleton** (`AddSingleton`): Created once on the first request and shared throughout the application lifetime. Ideal for caching, policy providers, or thread-safe state.
  - *Captive Dependency Trap*: Injecting a Scoped service into a Singleton causes memory leaks and stale state!

### Q3. What is the difference between `IEnumerable<T>` and `IQueryable<T>`?

- **Concept**: LINQ execution and SQL translation.
- **Key Answer**:
  - **`IEnumerable<T>`**: In-memory data iteration. LINQ filters (`.Where()`) are evaluated client-side in memory after fetching records from the database.
  - **`IQueryable<T>`**: Expression-tree based. LINQ filters are translated into raw SQL (e.g. `SELECT ... WHERE ...`) and executed directly on the database server.

### Q4. What is the difference between an Abstract Class and an Interface in modern C#?

- **Concept**: Object-oriented design and polymorphism.
- **Key Answer**:
  - An **Interface** defines a behavioral contract (a class can implement multiple interfaces). Since C# 8, interfaces can have default implementations, but cannot contain instance fields/state.
  - An **Abstract Class** is a base class that cannot be instantiated directly, can hold state (fields/constructors), and follows single inheritance.

### Q5. What is the purpose of `IDisposable` and the `using` statement?

- **Concept**: Unmanaged resource cleanup.
- **Key Answer**:
  - `IDisposable` provides a deterministic mechanism to release unmanaged resources (database connections, file streams, sockets) without waiting for the Garbage Collector.
  - The `using` statement/declaration is syntactic sugar for a `try / finally` block that guarantees `Dispose()` or `DisposeAsync()` is called.

### Q6. What is the difference between `String` and `StringBuilder`?

- **Concept**: Immutability and memory allocation.
- **Key Answer**:
  - `System.String` is **immutable**. Every string concatenation (`str += "a"`) creates a brand new string object on the heap.
  - `StringBuilder` is **mutable** and pre-allocates an internal buffer, avoiding repeated heap allocations in loops.

### Q7. What are the differences between `const` and `readonly` in C#?

- **Concept**: Compile-time vs runtime immutability.
- **Key Answer**:
  - `const`: Evaluated at **compile-time**, baked directly into the calling assembly, static by default, can only be primitive types.
  - `readonly`: Evaluated at **runtime**, can be initialized at declaration or inside a constructor, supports any type.

### Q8. What is the difference between `ref` and `out` parameters?

- **Concept**: Parameter passing semantics.
- **Key Answer**:
  - `ref`: The variable **must be initialized** before being passed to the method, and can be read and modified by the method.
  - `out`: The variable **does not need initialization** before passing, but the called method **must assign a value** before returning.

### Q9. What is Middleware in ASP.NET Core and how does the pipeline work?

- **Concept**: HTTP request/response pipeline.
- **Key Answer**:
  - Middleware is software assembled into an application pipeline to handle HTTP requests and responses sequentially (like Russian nesting dolls).
  - Each component can execute logic before and after calling `await next(context)`. Order is critical (e.g. `UseAuthentication` must precede `UseAuthorization`).

### Q10. What is the difference between Authentication and Authorization?

- **Concept**: Security fundamentals.
- **Key Answer**:
  - **Authentication (401 Unauthorized)**: Verifies *who you are* (e.g. validating password, JWT signature).
  - **Authorization (403 Forbidden)**: Verifies *what you are allowed to do* (e.g. evaluating roles, claims, dynamic policies).

---

## 🟡 Category 2: Medium / Intermediate (10 Questions)

### Q11. How does `async` and `await` work under the hood in C#?

- **Concept**: Async state machines and non-blocking I/O.
- **Key Answer**:
  - The C# compiler translates `async` methods into an **`IAsyncStateMachine` struct**.
  - When an uncompleted `await` is reached, the method captures the current state, registers a continuation on the task, and **yields the thread back to the ThreadPool**.
  - When the I/O completes (via OS I/O completion ports), a ThreadPool thread resumes execution at the saved state without thread blocking.

### Q12. What is the difference between `Task<T>` and `ValueTask<T>`?

- **Concept**: Heap allocation reduction in async paths.
- **Key Answer**:
  - `Task<T>` is a **reference type (class)** allocated on the heap for every asynchronous invocation.
  - `ValueTask<T>` is a **value type (struct)**. If an operation completes synchronously (e.g., cached value), `ValueTask` involves **zero heap allocation**. If it runs asynchronously, it wraps a `Task`.
  - *Rule*: Never `await` a `ValueTask` multiple times or concurrently!

### Q13. What is the N+1 Query Problem in EF Core and how do you prevent it?

- **Concept**: Relational database query efficiency.
- **Key Answer**:
  - Occurs when accessing child navigation properties inside a loop, triggering 1 query for the parent records + N queries for each child.
  - **Fixes**:
    1. **Eager Loading**: `.Include(x => x.Children)`.
    2. **Split Queries**: `.AsSplitQuery()` (avoids Cartesian product when loading multiple collections).
    3. **Projections**: Use `.Select(x => new Dto { ... })` to load only needed columns.

### Q14. What does `AsNoTracking()` do in EF Core and when should you use it?

- **Concept**: Change tracker overhead.
- **Key Answer**:
  - Disables the EF Core Change Tracker snapshotting mechanism.
  - Improves memory usage and CPU speed by up to 2–3x.
  - Use for all **read-only queries** where entities will not be updated or saved back to the database.

### Q15. Why should Access Tokens be short-lived and how does Refresh Token Rotation work?

- **Concept**: JWT security and replay attack mitigation.
- **Key Answer**:
  - Stateless JWTs cannot be easily revoked without distributed blacklists; keeping their lifespan short (15–30 mins) limits exposure if stolen.
  - **Refresh Token Rotation**: When the client exchanges an expired access token and refresh token, the server **invalidates the old refresh token immediately** and issues a brand new token pair. If an attacker attempts to reuse an old refresh token, the server rejects it.

### Q16. What is Clean Architecture and what is the "Dependency Rule"?

- **Concept**: Domain-centric software architecture.
- **Key Answer**:
  - An architecture where business entities (Domain) and use cases (Application) are at the core, while databases, frameworks, and UI (Infrastructure & Presentation) are external plugins.
  - **Dependency Rule**: Source code dependencies must **only point inward**. The Domain layer has 0 dependencies; Application depends only on Domain; Infrastructure and WebApi depend on Application.

### Q17. What is the difference between CQRS and the standard Repository pattern?

- **Concept**: Separation of read and write responsibilities.
- **Key Answer**:
  - **Standard Repository**: Combines CRUD operations into a single class per entity, often leading to bloated interfaces and compromised models for reads.
  - **CQRS (Command Query Responsibility Segregation)**: Strictly separates **Commands** (mutations altering state) from **Queries** (read-only projections). Allows optimizing writes for business invariants and reads for high performance.

### Q18. How does Garbage Collection work in .NET (Generations 0, 1, 2, LOH, POH)?

- **Concept**: CLR memory management.
- **Key Answer**:
  - **Gen 0**: Short-lived objects (temporary variables). Collected frequently and very fast.
  - **Gen 1**: Buffer generation for objects surviving Gen 0.
  - **Gen 2**: Long-lived objects (singletons, static data, DB pools). Collected least frequently.
  - **LOH (Large Object Heap)**: Objects >= 85,000 bytes. Not compacted by default to avoid memory copying overhead.
  - **POH (Pinned Object Heap)**: Objects pinned in memory for native interop.

### Q19. What is the difference between optimistic and pessimistic concurrency in databases?

- **Concept**: Multi-user transaction safety.
- **Key Answer**:
  - **Optimistic Concurrency**: Assumes conflicts are rare. Uses a concurrency token/timestamp (`RowVersion`). On update, if the token changed, throws `DbUpdateConcurrencyException`. High throughput, no locks.
  - **Pessimistic Locking**: Locks the record at the database level (`SELECT ... FOR UPDATE`). Prevents other transactions from reading/writing until committed. Eliminates conflicts but reduces concurrency.

### Q20. What is an Outbox Pattern and why is it used with message brokers?

- **Concept**: Distributed data consistency.
- **Key Answer**:
  - Solves the Dual-Write problem (e.g. saving an Order to DB + publishing an `OrderCreated` event to RabbitMQ). If the message broker drops after the DB save, data is inconsistent.
  - **Outbox Pattern**: Saves the entity AND the message into the same SQL database transaction (in an `OutboxMessages` table). A background worker (e.g. MassTransit / Hangfire) polls the Outbox table and reliably publishes messages with retries.

---

## 🔴 Category 3: Advanced / Senior (10 Questions)

### Q21. What are `Span<T>`, `ReadOnlySpan<T>`, and `Memory<T>`, and why are they revolutionary for .NET performance?

- **Concept**: Zero-allocation memory slicing.
- **Key Answer**:
  - `Span<T>` is a `ref struct` representing a contiguous region of arbitrary memory (stack, heap, or unmanaged) without allocating new objects or copying bytes.
  - Slicing (`span.Slice(0, 10)`) is $O(1)$ and performs **zero heap allocations**.
  - Because `Span<T>` is a `ref struct`, it can only live on the stack (cannot be used across `async/await` boundaries). `Memory<T>` is the heap-safe counterpart that can cross async boundaries.

### Q22. What causes ThreadPool Starvation and how do you diagnose and fix it?

- **Concept**: CLR thread scheduling and blocking sync-over-async.
- **Key Answer**:
  - **Cause**: Blocking calls like `.Result`, `.Wait()`, `Thread.Sleep()`, or long-running CPU tasks on ThreadPool worker threads. When many requests arrive and block threads, the ThreadPool cannot spawn new threads fast enough (default growth rate is ~1–2 threads/sec).
  - **Symptom**: High response latency, request timeouts, CPU usage may be low while queue length skyrockets.
  - **Fix**: Use pure `async/await` from top to bottom (no sync-over-async), offload heavy CPU work to dedicated threads or background workers.

### Q23. How does `IAuthorizationPolicyProvider` enable dynamic policies in ASP.NET Core?

- **Concept**: Dynamic runtime authorization.
- **Key Answer**:
  - Overrides `DefaultAuthorizationPolicyProvider.GetPolicyAsync(string policyName)`.
  - Instead of pre-registering hundreds of static policies at startup in `Program.cs`, it parses policy name prefixes (e.g. `"Permission:Users.Delete"`) at runtime and dynamically builds an `AuthorizationPolicy` with a `PermissionRequirement`.
  - Paired with an `AuthorizationHandler<PermissionRequirement>` that checks user claims or database permissions on demand.

### Q24. How do you implement API Idempotency safely in high-concurrency environments?

- **Concept**: Distributed idempotency and race condition prevention.
- **Key Answer**:
  - Client sends `Idempotency-Key: <UUID>`.
  - Server computes SHA-256 hash of `RequestBody + Route + UserId`.
  - Atomically checks cache/database:
    1. If key in-progress: returns `409 Conflict` or awaits lock (e.g. Redis `RedLock`).
    2. If key exists with **matching hash**: returns cached status code and response payload with header `X-Cache: IDEMPOTENT-HIT`.
    3. If key exists with **mismatched hash**: returns `422 Unprocessable Entity` (payload tampering/conflict).
    4. If new: executes business logic, caches completed response with a TTL (e.g. 24h).

### Q25. What is the difference between `IExceptionHandler` (.NET 8+) and standard try/catch middleware?

- **Concept**: Modern diagnostics and RFC 7807/9457 ProblemDetails.
- **Key Answer**:
  - `IExceptionHandler` integrates directly with ASP.NET Core's diagnostics infrastructure and `IProblemDetailsService`.
  - Avoids manual middleware try/catch allocations and allows chaining multiple single-responsibility handlers.
  - Returns standardized RFC Problem Details JSON (`status`, `title`, `detail`, `instance`, `traceId`) across all endpoints.

### Q26. How does .NET Aspire handle Service Discovery and Cloud-Native Orchestration?

- **Concept**: Modern distributed application architecture.
- **Key Answer**:
  - **AppHost**: Expresses the distributed topology (APIs, Redis, PostgreSQL, RabbitMQ) in C# code, injecting environment variables and endpoints automatically.
  - **Service Discovery**: Resolves friendly logical names (e.g. `http://webapi`) to actual physical ports/hosts via `Microsoft.Extensions.ServiceDiscovery`.
  - **ServiceDefaults**: Standardizes OpenTelemetry traces, metrics, logs, health checks (`/health`, `/alive`), and Polly HTTP resilience across all microservices.

### Q27. What is the difference between Domain Events and Integration Events?

- **Concept**: In-process vs out-of-process event communication.
- **Key Answer**:
  - **Domain Events**: In-process notifications published within the **same bounded context and database transaction** (e.g. using MediatR `INotification`) to synchronize side effects within the domain model.
  - **Integration Events**: Out-of-process messages serialized to JSON and published to a **message broker** (RabbitMQ/Kafka) to communicate state changes across different microservices or external systems.

### Q28. What is the "Captive Dependency" anti-pattern in Dependency Injection?

- **Concept**: Lifetime mismatch bugs.
- **Key Answer**:
  - Occurs when a service with a **longer lifetime** (e.g. `Singleton`) holds a reference to a service with a **shorter lifetime** (e.g. `Scoped`).
  - Example: Injecting `AppDbContext` (Scoped) into a Singleton background worker keeps that DbContext instance alive indefinitely, causing memory leaks, thread-safety concurrency crashes, and stale entity caches.
  - *Fix*: Inject `IServiceScopeFactory` into the Singleton and create a `using var scope = _scopeFactory.CreateScope()` to resolve Scoped dependencies safely.

### Q29. How does the EF Core Compiled Query feature work and when should you use it?

- **Concept**: High-throughput query performance.
- **Key Answer**:
  - Normally, EF Core compiles a LINQ expression tree into SQL on first execution and caches the SQL template.
  - `EF.CompileAsyncQuery` pre-compiles the query into a cached delegate, skipping the expression tree parsing step completely on subsequent calls.
  - Yields near-Dapper performance for high-frequency critical hot paths (e.g. looking up a user by ID or checking an idempotency key).

### Q30. What is the Out-Of-Memory (OOM) risk with the Large Object Heap (LOH) fragmentation?

- **Concept**: CLR memory fragmentation.
- **Key Answer**:
  - Objects $\ge 85,000$ bytes (large byte arrays, large strings) are allocated directly onto the LOH.
  - Gen 2 collections collect dead LOH objects, but **do not compact the LOH by default** (to avoid moving multi-megabyte memory blocks).
  - Repeatedly allocating and freeing variable-sized large arrays causes LOH fragmentation, leading to an `OutOfMemoryException` even when total free RAM is plentiful.
  - *Fix*: Use `ArrayPool<T>.Shared.Rent()` to reuse large memory buffers instead of constantly allocating new ones.
