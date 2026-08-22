# ASP.NET Core Identity, JWT & API Architecture (.NET 10)

A production-grade reference architecture for modern Web APIs built with **.NET 10 (C# 13)**, demonstrating **ASP.NET Core Identity**, **JWT Bearer Authentication**, **Refresh Token Rotation**, **Dynamic Policy Authorization (`IAuthorizationPolicyProvider`)**, and the **API Idempotency Pattern (Stripe Standard)**.

---

## 🌟 Key Features

- 🔐 **ASP.NET Core Identity & EF Core 10**: Complete membership system with PBKDF2 HMAC-SHA512 password hashing, user store, role management, and SQLite database.
- 🎟️ **Custom JWT & Refresh Token Rotation**: Signed JWT Access Tokens (HMAC-SHA256) with strict validation, custom claims, and single-use rotating refresh tokens to prevent replay attacks.
- 🛡️ **Dynamic Policy-Based Authorization**: Uses `IAuthorizationPolicyProvider` to evaluate granular permissions on demand via clean `[HasPermission(AppPermissions.UsersDelete)]` attributes without hardcoded startup configurations.
- ⚡ **API Idempotency Pattern**: Implements `Idempotency-Key` HTTP header validation, SHA-256 payload fingerprinting, and replay protection to prevent double-charging or duplicate resource creation.
- 📖 **Modern OpenAPI & Scalar UI**: Interactive browser-based API testing interface powered by `Scalar.AspNetCore` at `/scalar/v1`.
- 🧪 **Zero-Setup Testing**: Pre-seeded accounts (Admin, Manager, User) and ready-to-run HTTP test cases in `IdentityJwtDemo.http`.

---

## 🏗️ Project Architecture

```
├── Authorization/
│   ├── DynamicPermissionPolicyProvider.cs # Evaluates dynamic policies on the fly
│   ├── HasPermissionAttribute.cs          # [HasPermission("Users.Delete")] attribute
│   ├── PermissionAuthorizationHandler.cs  # Checks user claims & admin bypass
│   └── PermissionRequirement.cs           # IAuthorizationRequirement contract
├── Controllers/
│   ├── AuthController.cs                  # /register, /login, /refresh-token, /revoke-token, /grant-permission
│   ├── PaymentsController.cs              # /charge demonstrating [Idempotent] execution
│   ├── ResourcesController.cs             # Demonstrates [HasPermission] protected actions
│   └── UsersController.cs                 # Profile, role-protected admin & management dashboards
├── Data/
│   ├── AppDbContext.cs                    # IdentityDbContext<ApplicationUser> & Idempotency DbSet
│   └── DbInitializer.cs                   # Automatic migration & seed for roles and accounts
├── docs/                                  # 📚 Step-by-step learning modules (01 - 07)
│   ├── 01-introduction-and-techstack.md
│   ├── 02-database-and-identity-models.md
│   ├── 03-jwt-authentication-and-token-service.md
│   ├── 04-auth-controller-and-refresh-token-rotation.md
│   ├── 05-dynamic-policies-with-iauthorizationpolicyprovider.md
│   ├── 06-testing-and-debugging-guide.md
│   ├── 07-api-idempotency-pattern.md
│   └── README.md
├── DTOs/                                  # Data Transfer Objects & request models
│   ├── AssignRoleDto.cs
│   ├── AuthResponseDto.cs
│   ├── GrantPermissionDto.cs
│   ├── LoginDto.cs
│   ├── PaymentDtos.cs
│   ├── RefreshTokenRequestDto.cs
│   └── RegisterDto.cs
├── Idempotency/                           # Safe idempotent request handling
│   ├── IdempotencyCheckResult.cs
│   ├── IdempotencyService.cs              # Validates payload hash & caches responses
│   ├── IdempotentActionFilter.cs          # Intercepts requests with Idempotency-Key
│   ├── IdempotentAttribute.cs             # [Idempotent(ExpiresInHours = 24)]
│   ├── IdempotentRequestRecord.cs         # SQLite entity for cached idempotency records
│   └── IIdempotencyService.cs
├── Models/
│   ├── ApplicationUser.cs                 # Extends IdentityUser (FullName, RefreshToken, CreatedAt)
│   ├── Permissions.cs                     # Granular permission constants (Users.View, Reports.Export...)
│   └── UserRoles.cs                       # Predefined roles (Admin, Manager, User)
├── Services/
│   ├── AuthService.cs                     # Registration, login, token refresh & revoke orchestration
│   ├── IAuthService.cs
│   ├── ITokenService.cs
│   └── TokenService.cs                    # Signed JWT creation & cryptographic refresh tokens
├── appsettings.json                       # SQLite connection string & JWT settings
├── IdentityJwtDemo.http                   # Executable REST Client requests for VS Code / Visual Studio
└── Program.cs                             # Dependency injection, Identity options & middleware pipeline
```

---

## 🚀 Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Run the Application
```powershell
dotnet run
```

The application will automatically:
1. Initialize the SQLite database (`identity_demo.db`).
2. Create all ASP.NET Core Identity tables & Idempotency tables.
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
- ✅ **Authentication**: Login as Admin, Manager, or User.
- ✅ **Token Refresh & Revocation**: Test single-use refresh token rotation.
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
