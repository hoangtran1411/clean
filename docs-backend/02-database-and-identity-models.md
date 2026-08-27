# 02 - Database & Identity Models

## 1. How ASP.NET Core Identity Works

ASP.NET Core Identity uses Entity Framework Core to manage relational tables for authentication and authorization.

When you inherit your `DbContext` from `IdentityDbContext<ApplicationUser>`, EF Core automatically creates the following database tables:

| Database Table | Model Class | Purpose |
| :--- | :--- | :--- |
| `AspNetUsers` | `ApplicationUser` : `IdentityUser` | Stores user credentials, email, password hash, security stamps, and custom profile columns. |
| `AspNetRoles` | `IdentityRole` | Stores role definitions (`Admin`, `Manager`, `User`). |
| `AspNetUserRoles` | `IdentityUserRole<string>` | Join table linking users to their assigned roles (Many-to-Many). |
| `AspNetUserClaims` | `IdentityUserClaim<string>` | Granular claim key-value pairs assigned to individual users (e.g. `Permission` = `Users.Create`). |
| `AspNetRoleClaims` | `IdentityRoleClaim<string>` | Claims assigned to an entire role. |
| `AspNetUserLogins` | `IdentityUserLogin<string>` | External OAuth logins (e.g., Google, GitHub, Microsoft). |
| `AspNetUserTokens` | `IdentityUserToken<string>` | Security tokens for password reset, email confirmation, and 2FA. |

---

## 2. Extending `IdentityUser`

The base `IdentityUser` provides standard properties like `Id`, `UserName`, `Email`, `PasswordHash`, `PhoneNumber`, `EmailConfirmed`, `TwoFactorEnabled`, and `LockoutEnd`.

To add domain-specific fields or refresh token storage, we create [ApplicationUser.cs](../Models/ApplicationUser.cs):

```csharp
using Microsoft.AspNetCore.Identity;

namespace IdentityJwtDemo.Models;

public class ApplicationUser : IdentityUser
{
    // Custom domain property
    public string FullName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Refresh Token fields for persistent JWT token rotation
    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }
}
```

---

## 3. Configuring `AppDbContext`

In [AppDbContext.cs](../Data/AppDbContext.cs):

```csharp
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityJwtDemo.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // CRITICAL: Must call base.OnModelCreating(builder)
        // This ensures the Identity entity configurations and primary keys are registered!
        base.OnModelCreating(builder);
    }
}
```

---

## 4. Password Security & Hashing

When you call `userManager.CreateAsync(user, password)`:

1. ASP.NET Core Identity uses **PBKDF2 with HMAC-SHA512** (100,000 iterations by default).
2. A unique cryptographically random 128-bit salt is generated for every user.
3. The password hash is stored in `AspNetUsers.PasswordHash`.
4. A `SecurityStamp` is generated (a random GUID that changes whenever the user changes their password or email, invalidating active sessions).

---

## 5. Automatic Database Seeding on Startup

In [DbInitializer.cs](../Data/DbInitializer.cs), we seed default roles and users when the application starts:

```csharp
// Ensure the SQLite database file and tables exist
await context.Database.EnsureCreatedAsync();

// 1. Seed Roles: Admin, Manager, User
string[] roles = [UserRoles.Admin, UserRoles.Manager, UserRoles.User];
foreach (var role in roles)
{
    if (!await roleManager.RoleExistsAsync(role))
        await roleManager.CreateAsync(new IdentityRole(role));
}

// 2. Seed Default Admin User
if (await userManager.FindByEmailAsync("admin@example.com") == null)
{
    var admin = new ApplicationUser { UserName = "admin@example.com", Email = "admin@example.com", FullName = "Admin" };
    await userManager.CreateAsync(admin, "Admin@123456");
    await userManager.AddToRoleAsync(admin, UserRoles.Admin);
}
```

---

## What's Next?

Proceed to [03-jwt-authentication-and-token-service.md](../docs/03-jwt-authentication-and-token-service.md) to understand JWT token generation, claims structure, and cryptographic signing.
