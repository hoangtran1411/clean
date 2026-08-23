# Clean Architecture & .NET Aspire Reference Stack (.NET 10)

A production-grade reference architecture for modern Web APIs and distributed cloud-native applications built with **.NET 10 (C# 13)**, **.NET Aspire**, and **Clean Architecture**.

It brings together **CQRS (MediatR)**, **ASP.NET Core Identity**, **JWT Bearer Authentication**, **Refresh Token Rotation**, **Dynamic Policy Authorization (`IAuthorizationPolicyProvider`)**, **API Idempotency Pattern (Stripe Standard)**, **Global Exception Handling (`IExceptionHandler`)**, and **.NET Aspire Distributed Orchestration & OpenTelemetry**.

---

## 🌟 Key Architecture & Features

- 🚀 **.NET Aspire Cloud-Native Orchestration**:
  - `CleanArch.AppHost`: Orchestrates microservices, databases, and caches in pure C#.
  - `CleanArch.ServiceDefaults`: Standardized OpenTelemetry (traces, metrics, logs), standard health checks (`/health`, `/alive`), Polly HTTP resilience, and service discovery.
  - **Aspire Dashboard**: Live real-time dashboard displaying traces, logs, resource health, and metrics.
- 🏛️ **Clean Architecture (Onion / Hexagonal)**: Strict separation of concerns across 4 layers:
  - `CleanArch.Domain`: Pure business entities, constants, and custom domain exceptions (**0 external dependencies**).
  - `CleanArch.Application`: CQRS Commands/Queries (MediatR), FluentValidation pipeline behaviors, DTOs, and interface abstractions.
  - `CleanArch.Infrastructure`: EF Core 10 SQLite database context, Identity `UserManager`, JWT token cryptographic services.
  - `CleanArch.WebApi`: Presentation layer, controllers, dynamic policy providers, idempotency action filters, and Scalar OpenAPI UI.
- 🚨 **Modern Global Exception Handling (`IExceptionHandler`)**: Built-in .NET 10 asynchronous exception handling translating unhandled exceptions (`ValidationException`, `NotFoundException`, `ConflictException`, `DomainException`, `500 Server Errors`) into standard RFC 7807 / RFC 9457 Problem Details with distributed trace IDs.
- 📬 **CQRS Pattern with MediatR**: Commands (State Mutations) and Queries (Data Read) are separated and piped through automatic `ValidationBehavior` before execution.
- 🔐 **ASP.NET Core Identity & EF Core 10**: PBKDF2 HMAC-SHA512 password hashing, user stores, role management, and auto-seeded databases.
- 🎟️ **Custom JWT & Refresh Token Rotation**: Signed JWT Access Tokens (HMAC-SHA256) with strict validation, custom claims, and single-use rotating refresh tokens to prevent replay attacks.
- 🛡️ **Dynamic Policy-Based Authorization**: Uses `IAuthorizationPolicyProvider` to evaluate granular permissions on demand via clean `[HasPermission(AppPermissions.UsersDelete)]` attributes without hardcoded startup configurations.
- ⚡ **API Idempotency Pattern**: Implements `Idempotency-Key` HTTP header validation, SHA-256 payload fingerprinting, and replay protection to prevent double-charging or duplicate resource creation.
- 📖 **Modern OpenAPI & Scalar UI**: Interactive browser-based API testing interface powered by `Scalar.AspNetCore` at `/scalar/v1`.

---

## 🏗️ Multi-Project Solution Structure

```
IdentityCleanArch/
├── src/
│   ├── CleanArch.AppHost/                # 🌟 Aspire Orchestrator (AppHost)
│   │   ├── Program.cs                    # DistributedApplication.CreateBuilder(args)
│   │   └── CleanArch.AppHost.csproj
│   │
│   ├── CleanArch.ServiceDefaults/        # 🌟 Aspire Service Defaults & Observability
│   │   ├── Extensions.cs                 # AddServiceDefaults(), MapDefaultEndpoints()
│   │   └── CleanArch.ServiceDefaults.csproj
│   │
│   ├── CleanArch.Domain/                 # 1. Domain Layer (Pure C#, 0 dependencies)
│   │   ├── Common/ (BaseEntity.cs)
│   │   ├── Constants/ (UserRoles.cs, AppPermissions.cs)
│   │   ├── Entities/ (PaymentRecord.cs, IdempotentRecord.cs)
│   │   └── Exceptions/ (DomainException.cs, NotFoundException.cs, ConflictException.cs, ForbiddenException.cs)
│   │
│   ├── CleanArch.Application/            # 2. Application Layer (Depends only on Domain)
│   │   ├── Common/
│   │   │   ├── Behaviors/ (ValidationBehavior.cs - MediatR pipeline)
│   │   │   ├── Exceptions/ (ValidationException.cs)
│   │   │   ├── Interfaces/ (IAppDbContext, IAuthService, ITokenService, IIdempotencyService, ICurrentUserService)
│   │   │   └── Models/ (Result.cs, AuthResponse.cs, IdempotencyModels.cs)
│   │   ├── Features/
│   │   │   ├── Auth/Commands/ (Register, Login, RefreshToken, RevokeToken, GrantPermission)
│   │   │   ├── Payments/Commands/ (ChargePayment)
│   │   │   └── Users/Queries/ (GetUserProfile)
│   │   └── DependencyInjection.cs
│   │
│   ├── CleanArch.Infrastructure/         # 3. Infrastructure Layer (Implements Application interfaces)
│   │   ├── Identity/ (ApplicationUser.cs, AuthService.cs, TokenService.cs, CurrentUserService.cs)
│   │   ├── Persistence/ (AppDbContext.cs, DbInitializer.cs, IdempotencyService.cs)
│   │   └── DependencyInjection.cs
│   │
│   └── CleanArch.WebApi/                 # 4. Presentation Web API Layer
│       ├── Controllers/ (ApiControllerBase.cs, AuthController.cs, ErrorsTestController.cs, PaymentsController.cs, ResourcesController.cs, UsersController.cs)
│       ├── Authorization/ (DynamicPermissionPolicyProvider.cs, HasPermissionAttribute.cs, PermissionAuthorizationHandler.cs)
│       ├── Idempotency/ (IdempotentAttribute.cs, IdempotentActionFilter.cs)
│       ├── Middleware/ (GlobalExceptionHandler.cs - IExceptionHandler)
│       ├── appsettings.json
│       └── Program.cs
│
├── docs/                                 # 📚 Step-by-step learning modules (01 - 10)
├── IdentityJwtDemo.http                  # Executable REST Client requests for VS Code / Visual Studio
├── README.md
└── IdentityCleanArch.slnx
```

---

## 🚀 Getting Started

### Option 1: Run with .NET Aspire (Orchestrator & Live Dashboard)
```powershell
dotnet run --project src/CleanArch.AppHost
```
This launches the Web API along with the **Aspire Dashboard** at the URL printed in the console (e.g. `https://localhost:17180`).

### Option 2: Run Web API Directly
```powershell
dotnet run --project src/CleanArch.WebApi
```

---

## 👥 Pre-Seeded Test Accounts

| Role | Email | Password | Assigned Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` | `Admin@123456` | Full bypass (All permissions) |
| **Manager** | `manager@example.com` | `Manager@123456` | `Users.View`, `Reports.View`, `Reports.Export` |
| **Standard User** | `user@example.com` | `User@123456` | `Users.View` |

---

## 🧪 Testing the API

### 1. Interactive UI (Scalar API Reference)
Navigate to:
```
http://localhost:5000/scalar/v1
```

### 2. VS Code / Visual Studio REST Client
Open [**`IdentityJwtDemo.http`**](file:///C:/Users/Hoang/Desktop/clean/IdentityJwtDemo.http) to execute pre-configured requests:
- ✅ **Authentication**: Login as Admin, Manager, or User via MediatR `LoginCommand`.
- ✅ **Token Refresh & Revocation**: Test single-use refresh token rotation via MediatR.
- ✅ **Dynamic Permissions**: Test `Users.View`, `Reports.Export`, and `Users.Delete`.
- ✅ **Runtime Permission Granting**: Admin grants permissions dynamically to users.
- ✅ **Idempotency**: Test initial payments, identical retries (`X-Cache: IDEMPOTENT-HIT`), and payload modification conflicts (`422 Unprocessable Entity`).
- ✅ **Global Exceptions**: Test `404 Not Found`, `409 Conflict`, `400 Domain Error`, `403 Forbidden`, and `500 Server Error` formatted as RFC 7807/9457 Problem Details.

---

## 📚 Step-by-Step Learning Documentation

The `docs/` folder contains in-depth, step-by-step guides explaining every technical concept:

1. [**01 - Introduction & Tech Stack**](file:///C:/Users/Hoang/Desktop/clean/docs/01-introduction-and-techstack.md)
2. [**02 - Database & Identity Models**](file:///C:/Users/Hoang/Desktop/clean/docs/02-database-and-identity-models.md)
3. [**03 - JWT Authentication & Token Service**](file:///C:/Users/Hoang/Desktop/clean/docs/03-jwt-authentication-and-token-service.md)
4. [**04 - Auth Controller & Refresh Token Rotation**](file:///C:/Users/Hoang/Desktop/clean/docs/04-auth-controller-and-refresh-token-rotation.md)
5. [**05 - Dynamic Policies with `IAuthorizationPolicyProvider`**](file:///C:/Users/Hoang/Desktop/clean/docs/05-dynamic-policies-with-iauthorizationpolicyprovider.md)
6. [**06 - Testing & Debugging Guide**](file:///C:/Users/Hoang/Desktop/clean/docs/06-testing-and-debugging-guide.md)
7. [**07 - API Idempotency Pattern**](file:///C:/Users/Hoang/Desktop/clean/docs/07-api-idempotency-pattern.md)
8. [**08 - Clean Architecture & CQRS Deep-Dive**](file:///C:/Users/Hoang/Desktop/clean/docs/08-clean-architecture-deep-dive.md)
9. [**09 - Global Exception Handling & RFC ProblemDetails**](file:///C:/Users/Hoang/Desktop/clean/docs/09-global-exception-handling.md)
10. [**10 - .NET Aspire: Orchestration, Observability & Service Defaults**](file:///C:/Users/Hoang/Desktop/clean/docs/10-dotnet-aspire-orchestration-and-observability.md)
11. [**11 - Career & Technical Roadmap for a 2-Year .NET Developer**](file:///C:/Users/Hoang/Desktop/clean/docs/11-career-roadmap-for-2-year-dotnet-developer.md)
12. [**12 - Top 30 .NET Interview Questions (Easy, Medium, Advanced)**](file:///C:/Users/Hoang/Desktop/clean/docs/12-top-30-dotnet-interview-questions.md)
13. [**13 - In-Memory Cache & Output Cache Deep-Dive**](file:///C:/Users/Hoang/Desktop/clean/docs/13-inmemory-cache-and-output-cache.md)
14. [**14 - Structured Logging with Serilog, Correlation IDs & MediatR Pipeline**](file:///C:/Users/Hoang/Desktop/clean/docs/14-structured-logging-serilog-and-telemetry.md)
15. [**15 - Excel Import & Export with EPPlus (Beginner ➔ Mid ➔ Expert)**](file:///C:/Users/Hoang/Desktop/clean/docs/15-excel-import-and-export-with-epplus.md)
16. [**16 - Understanding and Mastering `.http` Files**](file:///C:/Users/Hoang/Desktop/clean/docs/16-understanding-and-mastering-http-files.md)
17. [**17 - .NET CLI Mastery & Essential Commands Cheat Sheet**](file:///C:/Users/Hoang/Desktop/clean/docs/17-dotnet-cli-mastery-and-cheat-sheet.md)
18. [**18 - Understanding and Configuring `.editorconfig`**](file:///C:/Users/Hoang/Desktop/clean/docs/18-understanding-and-configuring-editorconfig.md)
19. [**19 - Centralized Solution Management with `Directory.Build.props`**](file:///C:/Users/Hoang/Desktop/clean/docs/19-centralized-solution-management-with-directory-build-props.md)
