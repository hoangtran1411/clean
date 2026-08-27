# 01 - Introduction & Tech Stack

## Overview

In modern backend architecture, securing Web APIs requires a robust authentication (who you are) and authorization (what you can do) system. This project demonstrates an enterprise-grade security architecture using **.NET 10**, **ASP.NET Core Identity**, and **JSON Web Tokens (JWT)** with dynamic policy evaluation.

---

## The Tech Stack

| Technology | Role & Purpose |
| :--- | :--- |
| **.NET 10 (C# 13)** | The latest high-performance, cross-platform framework by Microsoft. |
| **ASP.NET Core Identity** | Comprehensive membership system handling password hashing (PBKDF2 HMAC-SHA512), user records, email confirmation, security stamps, and lockout policies. |
| **Entity Framework Core 10** | Modern ORM connecting ASP.NET Core Identity to database tables. Configured with SQLite for local development and easily switchable to PostgreSQL or SQL Server. |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | Middleware that validates incoming JWT tokens in the `Authorization: Bearer <token>` HTTP header. |
| **IAuthorizationPolicyProvider** | Dynamic authorization provider creating policies on the fly without hardcoded startup configurations. |
| **Scalar API Reference** | Modern, interactive API testing UI powered by OpenAPI in .NET 10. |

---

## Authentication vs. Authorization

```mermaid
graph TD
    Request[HTTP Request] --> AuthCheck{1. Authentication Middleware}
    AuthCheck -->|Valid Token| UserContext[Set HttpContext.User & Claims]
    AuthCheck -->|Invalid / Missing Token| 401[401 Unauthorized]
    UserContext --> AuthorizeCheck{2. Authorization Middleware}
    AuthorizeCheck -->|Has Required Role / Permission| Action[Execute Controller Action 200 OK]
    AuthorizeCheck -->|Missing Role / Permission| 403[403 Forbidden]
```

- **Authentication (401 Unauthorized)**: Answers *"Who is making this request?"*. Checked by `UseAuthentication()` verifying the cryptographic signature and expiration of the JWT.
- **Authorization (403 Forbidden)**: Answers *"Does this authenticated user have permission to perform this action?"*. Checked by `UseAuthorization()` evaluating roles, claims, and policies.

---

## Architecture Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend / Mobile App
    participant AuthAPI as Auth Controller
    participant Identity as UserManager (Identity)
    participant TokenSvc as Token Service
    participant ProtectedAPI as Protected Endpoint

    Note over Client, TokenSvc: 1. Authentication Phase
    Client->>AuthAPI: POST /api/auth/login (Email, Password)
    AuthAPI->>Identity: Verify password hash
    Identity-->>AuthAPI: Credentials valid
    AuthAPI->>TokenSvc: Build JWT (Claims: Sub, Email, Roles, Permissions)
    AuthAPI->>Identity: Persist Refresh Token to DB
    AuthAPI-->>Client: Returns { AccessToken, RefreshToken }

    Note over Client, ProtectedAPI: 2. Resource Access Phase
    Client->>ProtectedAPI: GET /api/resources/users-list [Authorization: Bearer <AccessToken>]
    ProtectedAPI->>ProtectedAPI: JwtBearer validates signature & claims
    ProtectedAPI-->>Client: 200 OK (Data)
```

---

## What's Next?

Proceed to [02-database-and-identity-models.md](file:///C:/Users/Hoang/Desktop/clean/docs/02-database-and-identity-models.md) to learn how ASP.NET Core Identity models and Entity Framework Core work under the hood.
