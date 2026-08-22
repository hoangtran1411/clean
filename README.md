# Clean Architecture Identity, JWT & API Architecture (.NET 10)

A production-grade reference architecture for modern Web APIs built with **.NET 10 (C# 13)** and **Clean Architecture**, demonstrating **CQRS (MediatR)**, **ASP.NET Core Identity**, **JWT Bearer Authentication**, **Refresh Token Rotation**, **Dynamic Policy Authorization (`IAuthorizationPolicyProvider`)**, and the **API Idempotency Pattern (Stripe Standard)**.

---

## 🌟 Key Architecture & Features

- 🏛️ **Clean Architecture (Onion / Hexagonal)**: Strict separation of concerns with 4 distinct layers:
  - `CleanArch.Domain`: Pure business entities, constants, and exceptions (**0 external dependencies**).
  - `CleanArch.Application`: CQRS Commands/Queries (MediatR), FluentValidation pipeline behaviors, DTOs, and interface abstractions.
  - `CleanArch.Infrastructure`: EF Core 10 SQLite database context, Identity `UserManager`, JWT token cryptographic services.
  - `CleanArch.WebApi`: Presentation layer, controllers, dynamic policy providers, idempotency action filters, and Scalar OpenAPI UI.
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
│   ├── CleanArch.Domain/                 # 1. Domain Layer (Pure C#, 0 dependencies)
│   │   ├── Common/ (BaseEntity.cs)
│   │   ├── Constants/ (UserRoles.cs, AppPermissions.cs)
│   │   ├── Entities/ (PaymentRecord.cs, IdempotentRecord.cs)
│   │   └── Exceptions/ (DomainException.cs)
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
│       ├── Controllers/ (ApiControllerBase.cs, AuthController.cs, PaymentsController.cs, ResourcesController.cs, UsersController.cs)
│       ├── Authorization/ (DynamicPermissionPolicyProvider.cs, HasPermissionAttribute.cs, PermissionAuthorizationHandler.cs)
│       ├── Idempotency/ (IdempotentAttribute.cs, IdempotentActionFilter.cs)
│       ├── Middleware/ (CustomExceptionHandlerMiddleware.cs)
│       ├── appsettings.json
│       └── Program.cs
│
├── docs/                                 # 📚 Step-by-step learning modules (01 - 08)
├── IdentityJwtDemo.http                  # Executable REST Client requests for VS Code / Visual Studio
├── README.md
└── IdentityCleanArch.slnx
```

---

## 🚀 Getting Started

### Run the Web API
```powershell
dotnet run --project src/CleanArch.WebApi
```

The application will automatically:
1. Initialize the SQLite database (`clean_identity.db`).
2. Create all ASP.NET Core Identity tables, Payment tables & Idempotency tables.
3. Seed default roles (`Admin`, `Manager`, `User`) and test accounts with permissions.

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
