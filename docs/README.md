# .NET 10 Identity, JWT, Clean Architecture, Aspire & Enterprise Stack - Learning Path

Welcome to the step-by-step learning guide for ASP.NET Core Identity, JWT authentication, dynamic authorization, API idempotency, **Clean Architecture with CQRS**, **Global Exception Handling**, **.NET Aspire Orchestration**, **Caching**, **Structured Logging**, **Excel Import/Export with EPPlus**, **.http File Mastery**, **.NET CLI Mastery**, and **Interview Preparation** in **.NET 10**.

---

## 📚 Step-by-Step Learning Modules

1. [**01 - Introduction & Tech Stack**](file:///C:/Users/Hoang/Desktop/clean/docs/01-introduction-and-techstack.md)
   - Architecture overview
   - Authentication vs. Authorization in Web APIs
   - .NET 10 & C# 13 ecosystem

2. [**02 - Database & Identity Models**](file:///C:/Users/Hoang/Desktop/clean/docs/02-database-and-identity-models.md)
   - Understanding `IdentityDbContext<T>` and standard Identity tables
   - Extending `IdentityUser` with `ApplicationUser`
   - Password hashing with PBKDF2 HMAC-SHA512
   - Seeding default roles & admins on startup

3. [**03 - JWT Authentication & Token Service**](file:///C:/Users/Hoang/Desktop/clean/docs/03-jwt-authentication-and-token-service.md)
   - Anatomy of a JWT: Header, Payload (Claims), Signature
   - Implementing `TokenService` with HMAC-SHA256
   - Configuring `JwtBearer` middleware with `TokenValidationParameters`

4. [**04 - Auth Controller & Refresh Token Rotation**](file:///C:/Users/Hoang/Desktop/clean/docs/04-auth-controller-and-refresh-token-rotation.md)
   - Why short-lived access tokens + long-lived refresh tokens?
   - Implementing single-use refresh token rotation
   - Token revocation / Logout

5. [**05 - Dynamic Policies with `IAuthorizationPolicyProvider`**](file:///C:/Users/Hoang/Desktop/clean/docs/05-dynamic-policies-with-iauthorizationpolicyprovider.md)
   - Why static policies don't scale
   - Dynamic policy provider & requirement handlers
   - Declarative permission security with `[HasPermission("...")]`

6. [**06 - Testing & Debugging Guide**](file:///C:/Users/Hoang/Desktop/clean/docs/06-testing-and-debugging-guide.md)
   - Testing via Scalar OpenAPI UI (`/scalar/v1`)
   - Testing via `IdentityJwtDemo.http`
   - Troubleshooting common HTTP 401 & 403 errors

7. [**07 - API Idempotency Pattern**](file:///C:/Users/Hoang/Desktop/clean/docs/07-api-idempotency-pattern.md)
   - What is Idempotency & why it prevents double billing
   - The `Idempotency-Key` HTTP header protocol (Stripe standard)
   - SHA-256 Request Payload hashing & replay detection
   - Implementing `[Idempotent]` Action Filter in .NET 10

8. [**08 - Clean Architecture & CQRS Deep-Dive**](file:///C:/Users/Hoang/Desktop/clean/docs/08-clean-architecture-deep-dive.md)
   - The Dependency Rule (Inward dependencies)
   - Layer breakdown: Domain, Application, Infrastructure, WebApi
   - CQRS with MediatR (Commands, Queries, Handlers)
   - Automatic request validation with FluentValidation & Pipeline Behaviors

9. [**09 - Global Exception Handling & RFC ProblemDetails**](file:///C:/Users/Hoang/Desktop/clean/docs/09-global-exception-handling.md)
   - Modern `IExceptionHandler` & `IProblemDetailsService` in .NET 10
   - Standard RFC Problem Details format
   - Clean Architecture exception hierarchy (`ValidationException`, `NotFoundException`, `ConflictException`, `DomainException`)
   - Distributed trace correlation

10. [**10 - .NET Aspire: Orchestration, Observability & Service Defaults**](file:///C:/Users/Hoang/Desktop/clean/docs/10-dotnet-aspire-orchestration-and-observability.md)
    - The 3 Pillars of Aspire: Orchestration, Components, Observability
    - `CleanArch.AppHost`: C# cloud-native application orchestrator
    - `CleanArch.ServiceDefaults`: OpenTelemetry, Health Checks (`/health`, `/alive`), Polly resilience & service discovery
    - The real-time Aspire Developer Dashboard

11. [**11 - Career & Technical Roadmap for a 2-Year .NET Developer**](file:///C:/Users/Hoang/Desktop/clean/docs/11-career-roadmap-for-2-year-dotnet-developer.md)
    - The 6 Core Knowledge Pillars (CLR Internals, DDD/Clean Architecture, Data Optimization, Distributed Systems, Security, Observability)
    - The Junior ➔ Mid ➔ Senior mindset shift
    - Real-world milestone projects to master
    - Recommended books, authors & resources

12. [**12 - Top 30 .NET & ASP.NET Core Interview Questions (Easy, Medium, Advanced)**](file:///C:/Users/Hoang/Desktop/clean/docs/12-top-30-dotnet-interview-questions.md)
    - 10 Easy / Foundational Questions (Value vs Reference types, DI lifetimes, `IEnumerable` vs `IQueryable`, Middleware)
    - 10 Medium / Intermediate Questions (Async State Machine, `Task` vs `ValueTask`, N+1 queries, Refresh Token Rotation, Outbox Pattern)
    - 10 Advanced / Senior Questions (`Span<T>` memory slicing, ThreadPool starvation, Distributed Idempotency, `IAuthorizationPolicyProvider`, LOH fragmentation)

13. [**13 - In-Memory Cache (`IMemoryCache`) & Output Cache (`[OutputCache]`)**](file:///C:/Users/Hoang/Desktop/clean/docs/13-inmemory-cache-and-output-cache.md)
    - Application-layer caching with `IMemoryCache` (sliding vs absolute expiration)
    - Middleware-layer caching with `[OutputCache]` (complete HTTP response caching)
    - Tag-based invalidation with `IOutputCacheStore.EvictByTagAsync`
    - VaryBy route/query parameters and built-in cache stampede protection

14. [**14 - Structured Logging with Serilog, Correlation IDs & MediatR Pipeline**](file:///C:/Users/Hoang/Desktop/clean/docs/14-structured-logging-serilog-and-telemetry.md)
    - Unstructured vs Structured Logging & Message Templates
    - Serilog Sinks (Console, Daily Rolling File) & LogContext Enrichment
    - MediatR `LoggingBehavior` and `PerformanceBehavior` (automatic long-running request alerts)
    - Distributed tracing with `CorrelationIdMiddleware` (`X-Correlation-ID` header)

15. [**15 - Excel Import & Export with EPPlus (Beginner ➔ Mid ➔ Expert)**](file:///C:/Users/Hoang/Desktop/clean/docs/15-excel-import-and-export-with-epplus.md)
    - 🟢 **Beginner**: Workbooks, Worksheets, Cell indexers, License context
    - 🟡 **Mid-Level**: Number formatting (`$#,##0.00`), Table Styles (`Medium9`), AutoFit columns, Freeze panes
    - 🔴 **Expert**: Excel Formulas (`AVERAGE`, `SUM`), Conditional Formatting, Data Validation dropdowns, Streaming upload with row-by-row error reporting

16. [**16 - Understanding and Mastering `.http` Files**](file:///C:/Users/Hoang/Desktop/clean/docs/16-understanding-and-mastering-http-files.md)
    - What is an `.http` file and why it replaces Postman in modern teams
    - Core syntax: Request delimiters (`###`), variables (`@var`), and response chaining (`# @name`)
    - Complete walkthrough of `IdentityJwtDemo.http`
    - Executing `.http` files in Visual Studio, VS Code, and CI/CD

17. [**17 - .NET CLI Mastery & Essential Commands Cheat Sheet**](file:///C:/Users/Hoang/Desktop/clean/docs/17-dotnet-cli-mastery-and-cheat-sheet.md)
    - How `dotnet.exe` and MSBuild operate under the hood
    - Cheat sheet: Project management, NuGet auditing (`--outdated`, `--vulnerable`), Hot Reload (`dotnet watch`), formatting, single-file publish, and EF Core tools
    - Diagnostic tools (`dotnet-counters`, `dotnet-trace`, `dotnet-dump`)
