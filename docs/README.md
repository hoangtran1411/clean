# .NET 10 Identity, JWT, Clean Architecture & API Architecture - Learning Path

Welcome to the step-by-step learning guide for ASP.NET Core Identity, JWT authentication, dynamic authorization, API idempotency, **Clean Architecture with CQRS**, and **Modern Global Exception Handling** in **.NET 10**.

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

9. [**09 - Global Exception Handling & RFC 7807/9457 ProblemDetails**](file:///C:/Users/Hoang/Desktop/clean/docs/09-global-exception-handling.md)
   - Modern `IExceptionHandler` & `IProblemDetailsService` in .NET 10
   - Standard RFC Problem Details format
   - Clean Architecture exception hierarchy (`ValidationException`, `NotFoundException`, `ConflictException`, `DomainException`)
   - Distributed trace correlation
