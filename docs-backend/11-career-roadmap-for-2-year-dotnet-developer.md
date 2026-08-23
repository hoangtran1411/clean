# 11 - Career & Technical Roadmap for a 2-Year .NET Developer

## 1. The Mindset Shift: Junior ➔ Mid ➔ Senior

At **2 years of experience**, you already know how to write C# syntax, build basic CRUD Web APIs, write EF Core queries, and configure Dependency Injection.

To progress from **Junior/Mid to Strong Mid/Senior**, the transition is about shifting focus:
- **From**: *"Does my code work?"*
- **To**: *"Is my code maintainable, testable, resilient, performant, and secure under high load?"*

```
   Level 1 (0-1 Year): "Make it work"
         ↓
   Level 2 (1-3 Years): "Make it right" (Clean Architecture, DDD, Unit & Integration Tests, Robust Error Handling)
         ↓
   Level 3 (3-5+ Years): "Make it fast & resilient" (Distributed Systems, Performance, Messaging, Cloud-Native, Observability)
```

---

## 2. The 6 Core Knowledge Pillars to Master

### Pillar 1: Advanced C# & CLR Internals (Under the Hood)
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **Garbage Collection (GC)** | Understand Generation 0, 1, 2, Large Object Heap (LOH), and Pinned Object Heap (POH). Learn how allocations cause GC pauses and latency spikes. |
| **Memory Optimization** | `Span<T>`, `ReadOnlySpan<T>`, `Memory<T>`, `ArrayPool<T>`, `ref struct`, and avoiding string concatenation allocations. |
| **Async/Await Mechanics** | Understand Async State Machines, `SynchronizationContext`, avoiding `async void`, `ValueTask` vs `Task`, and preventing Thread Pool starvation. |
| **LINQ & Expression Trees** | How `IQueryable<T>` compiles Expression Trees into SQL vs `IEnumerable<T>` in-memory execution. |

---

### Pillar 2: Clean Architecture & Domain-Driven Design (DDD)
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **Clean / Onion Architecture** | Inversion of Control, separating business logic from frameworks, databases, and UI (what we built in this project!). |
| **DDD Tactical Patterns** | Entities, Value Objects (immutable by value), Aggregate Roots (transactional consistency boundary), Domain Events. |
| **CQRS Pattern** | Separating Commands (writes/mutations) from Queries (reads) using MediatR or Wolverine. |
| **Modular Monolith** | Organizing complex enterprise codebases into isolated modules with clear boundaries before jumping to microservices. |

---

### Pillar 3: High-Performance Data Access (EF Core + Dapper)
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **EF Core Query Optimization** | `AsNoTracking()`, `AsSplitQuery()` (avoid Cartesian explosion), projection queries (`Select`), avoiding the N+1 query trap. |
| **Database Indexing & Query Plans** | Understanding B-Tree indexes, composite indexes, execution plans, and index seeks vs table scans in SQL Server / PostgreSQL. |
| **Concurrency Management** | Optimistic Concurrency (Concurrency Tokens / `RowVersion`) vs Pessimistic Locking (`SELECT FOR UPDATE`). |
| **Hybrid ORM Approach** | Using EF Core for complex business writes and Dapper / Raw SQL / Compiled Queries for blazing-fast read queries. |

---

### Pillar 4: Distributed Systems, Caching & Messaging
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **Caching Strategies** | Cache-Aside pattern, Distributed Caching (Redis), In-Memory Cache, Cache Invalidation, and `.NET 9/10 HybridCache`. |
| **Asynchronous Messaging** | Message Brokers (RabbitMQ, Kafka, Azure Service Bus) using **MassTransit** or **Wolverine**. |
| **The Outbox Pattern** | Ensuring transactional consistency between database updates and message publishing without 2-phase commits (2PC). |
| **API Idempotency** | Using `Idempotency-Key` headers to guarantee safe network retries (covered in Module 07). |
| **Resilience Patterns (Polly)** | Retries with exponential backoff & jitter, Circuit Breaker, Rate Limiting, and Fallbacks. |

---

### Pillar 5: Enterprise Security & Identity
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **OAuth 2.0 & OpenID Connect** | Authorization Code Flow with PKCE, Client Credentials, Token introspection, IdentityServer / Duende / OpenIddict / Keycloak. |
| **ASP.NET Core Identity & JWT** | Token rotation, dynamic policy authorization (`IAuthorizationPolicyProvider`), password hashing, 2FA/TOTP. |
| **API Security Best Practices** | CORS, Content Security Policy (CSP), Anti-Forgery tokens, Rate limiting, preventing SQL Injection / IDOR / SSRF. |

---

### Pillar 6: Observability, Cloud-Native & Testing
| Topic | Why It Matters & What to Learn |
| :--- | :--- |
| **.NET Aspire & OpenTelemetry** | Distributed tracing, live metrics, structured logging with correlation IDs (`traceId`), and OpenTelemetry Exporters. |
| **Testing Pyramid** | • **Unit Testing**: xUnit, NSubstitute/Moq, FluentAssertions, Bogus (fake data).<br>• **Integration Testing**: `WebApplicationFactory<T>`, **Testcontainers** (spinning up real Docker DBs in tests).<br>• **Architecture Testing**: NetArchTest (enforcing Clean Architecture dependency rules in CI). |
| **Docker & CI/CD** | Multi-stage Dockerfiles, GitHub Actions / Azure DevOps CI/CD pipelines. |

---

## 3. Practical Milestones / Projects to Build

To showcase senior-level expertise, build or practice these 3 key real-world systems:

1. **E-Commerce Checkout Engine (Distributed & Resilient)**:
   - Clean Architecture + CQRS + Outbox Pattern with MassTransit (RabbitMQ).
   - Stripe/Payment integration with `Idempotency-Key` protection.
   - Redis distributed locking (`RedLock`) to prevent double-booking limited inventory.

2. **Multi-Tenant SaaS API with Role & Dynamic Permission System**:
   - Multi-tenant database isolation (Schema-per-tenant or Column-per-tenant).
   - Dynamic `IAuthorizationPolicyProvider` with granular permissions.
   - Refresh token rotation & session revocation.

3. **High-Throughput Analytics Ingestion Pipeline**:
   - Ingesting thousands of requests per second using Channel / BackgroundService workers.
   - Batching database inserts with `EF Core BulkExtensions` or `NpgsqlBinaryImporter`.
   - Instrumented with OpenTelemetry, Prometheus, and Grafana.

---

## 4. Top Recommended Books & Resources

### 📖 Essential Books
1. **"C# in Depth" (4th Edition)** — Jon Skeet *(Mastering C# features)*
2. **"Domain-Driven Design: Tackling Complexity in the Heart of Software"** — Eric Evans
3. **"CLR via C#"** — Jeffrey Richter *(Deep-dive into .NET internals and memory)*
4. **"Designing Data-Intensive Applications"** — Martin Kleppmann *(The bible of distributed systems)*
5. **"Enterprise Application Architecture Patterns"** — Martin Fowler

### 🌐 Key People & Repositories to Follow
- **Nick Chapsas / Keep Coding** (YouTube / Dometrain)
- **Milan Jovanović** (Clean Architecture & .NET newsletter)
- **Stephen Cleary** (Async programming in C#)
- **David Fowler** (Microsoft .NET Architect - Aspire & Async guidance)
- **Steve Smith (Ardalis)** (Clean Architecture & Specification Pattern)
