# 05 - Dynamic Policies with `IAuthorizationPolicyProvider`

## 1. Problem with Static Policies

In standard ASP.NET Core, policies are hardcoded inside `Program.cs`:
```csharp
// ❌ Static Approach: Not scalable
builder.Services.AddAuthorization(options => {
    options.AddPolicy("CanCreateUser", p => p.RequireClaim("Permission", "Users.Create"));
    options.AddPolicy("CanDeleteUser", p => p.RequireClaim("Permission", "Users.Delete"));
    // ... hundreds of policies
});
```

Whenever you introduce a new feature or permission, you must modify `Program.cs` and recompile.

---

## 2. The Dynamic Authorization Pattern

With `IAuthorizationPolicyProvider`, ASP.NET Core resolves policies **dynamically on demand**:

```
[HasPermission("Users.Delete")]
  ↓
Policy Name: "Permission:Users.Delete"
  ↓
DynamicPermissionPolicyProvider.GetPolicyAsync("Permission:Users.Delete")
  ↓
Builds AuthorizationPolicy with PermissionRequirement("Users.Delete")
  ↓
PermissionAuthorizationHandler.HandleRequirementAsync(...)
```

---

## 3. Step-by-Step Implementation

### Step 1: Create the Requirement
In [PermissionRequirement.cs](file:///C:/Users/Hoang/Desktop/clean/Authorization/PermissionRequirement.cs):
```csharp
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}
```

### Step 2: Implement the Policy Provider
In [DynamicPermissionPolicyProvider.cs](file:///C:/Users/Hoang/Desktop/clean/Authorization/DynamicPermissionPolicyProvider.cs):
```csharp
public class DynamicPermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public const string PolicyPrefix = "Permission:";

    public DynamicPermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options) {}

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(PolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var permission = policyName[PolicyPrefix.Length..];
            var policy = new AuthorizationPolicyBuilder();
            policy.AddRequirements(new PermissionRequirement(permission));
            return policy.Build();
        }

        return await base.GetPolicyAsync(policyName);
    }
}
```

### Step 3: Implement the Authorization Handler
In [PermissionAuthorizationHandler.cs](file:///C:/Users/Hoang/Desktop/clean/Authorization/PermissionAuthorizationHandler.cs):
```csharp
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement req)
    {
        if (context.User.Identity?.IsAuthenticated != true) return Task.CompletedTask;

        // Admin override: Super-Admins have full access
        if (context.User.IsInRole(UserRoles.Admin))
        {
            context.Succeed(req);
            return Task.CompletedTask;
        }

        // Check if user has the specific permission claim
        var hasClaim = context.User.Claims.Any(c =>
            string.Equals(c.Type, AppPermissions.ClaimType, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(c.Value, req.Permission, StringComparison.OrdinalIgnoreCase));

        if (hasClaim)
        {
            context.Succeed(req);
        }

        return Task.CompletedTask;
    }
}
```

### Step 4: Create the Clean Attribute
In [HasPermissionAttribute.cs](file:///C:/Users/Hoang/Desktop/clean/Authorization/HasPermissionAttribute.cs):
```csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
        : base(policy: $"{DynamicPermissionPolicyProvider.PolicyPrefix}{permission}")
    {
    }
}
```

---

## 4. Protecting Endpoints Declaratively

In [ResourcesController.cs](file:///C:/Users/Hoang/Desktop/clean/Controllers/ResourcesController.cs):

```csharp
[HttpDelete("delete-user-record/{id}")]
[HasPermission(AppPermissions.UsersDelete)]
public IActionResult DeleteUserRecord(string id)
{
    return Ok($"User {id} deleted.");
}
```

---

## What's Next?
Proceed to [06-testing-and-debugging-guide.md](file:///C:/Users/Hoang/Desktop/clean/docs/06-testing-and-debugging-guide.md) for how to run and test all authentication, refresh, and permission flows.
