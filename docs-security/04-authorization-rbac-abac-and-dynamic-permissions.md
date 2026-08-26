# 04 - Authorization, RBAC, ABAC & Dynamic Permission Enforcement

Authorization answers **"What is this authenticated user permitted to do?"**. While Authentication verifies identity, Authorization enforces access boundaries.

---

## 1. Access Control Paradigms

```
┌───────────────────────────┐    ┌───────────────────────────┐    ┌───────────────────────────┐
│           RBAC            │    │           PBAC            │    │           ABAC            │
│ (Role-Based Access Ctrl)  │    │(Permission-Based Access)  │    │(Attribute-Based Access)   │
├───────────────────────────┤    ├───────────────────────────┤    ├───────────────────────────┤
│ "Is user an Admin?"       │    │ "Does user have           │    │ "Is user the Creator of   │
│ Coarse-grained, rigid.    │    │  'Products.Create' claim?"│    │  this document AND in the │
│ Hard to scale as roles    │    │ Flexible, decoupled from  │    │  same department during   │
│ explode in size.          │    │ user job titles.          │    │  business hours?"         │
└───────────────────────────┘    └───────────────────────────┘    └───────────────────────────┘
```

---

## 2. Dynamic Policy-Based Authorization in ASP.NET Core

In enterprise systems, hardcoding roles (e.g. `[Authorize(Roles = "Admin,Manager")]`) causes tight coupling. Instead, we use fine-grained permission claims evaluated at runtime using `IAuthorizationPolicyProvider`.

### Step 1: Define Static Permission Constants
```csharp
namespace CleanArch.Domain.Constants;

public static class AppPermissions
{
    public const string ProductsRead   = "Permissions.Products.Read";
    public const string ProductsCreate = "Permissions.Products.Create";
    public const string ProductsUpdate = "Permissions.Products.Update";
    public const string ProductsDelete = "Permissions.Products.Delete";

    public const string UsersManage    = "Permissions.Users.Manage";
    public const string RolesManage    = "Permissions.Roles.Manage";
}
```

### Step 2: Custom Policy Requirement
```csharp
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }
    public PermissionRequirement(string permission) => Permission = permission;
}
```

### Step 3: Dynamic Policy Provider
Instead of manually registering hundreds of policies in `Program.cs`, the custom provider dynamically builds the policy on demand when an endpoint requests it:

```csharp
public class DynamicPermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    private readonly AuthorizationOptions _options;

    public DynamicPermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
    {
        _options = options.Value;
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // If a standard policy exists, return it
        var policy = await base.GetPolicyAsync(policyName);
        if (policy is not null) return policy;

        // If policy starts with our permission prefix, generate requirement dynamically
        if (policyName.StartsWith("Permissions.", StringComparison.OrdinalIgnoreCase))
        {
            var dynamicPolicy = new AuthorizationPolicyBuilder()
                .AddRequirements(new PermissionRequirement(policyName))
                .Build();

            _options.AddPolicy(policyName, dynamicPolicy);
            return dynamicPolicy;
        }

        return null;
    }
}
```

### Step 4: Authorization Handler
Evaluates whether the user's claims contain the required permission:

```csharp
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var user = context.User;
        if (user is null || !user.Identity?.IsAuthenticated == true)
        {
            return Task.CompletedTask;
        }

        // Check if user has permission claim directly or via their assigned roles
        var hasPermission = user.Claims.Any(c =>
            c.Type == "permission" &&
            c.Value.Equals(requirement.Permission, StringComparison.OrdinalIgnoreCase));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
```

### Step 5: Clean Custom Attribute
```csharp
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = false)]
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission) : base(policy: permission)
    {
    }
}
```

### Usage in Controller:
```csharp
[HttpPost]
[HasPermission(AppPermissions.ProductsCreate)]
public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
{
    var result = await _mediator.Send(command);
    return CreatedAtAction(nameof(GetById), new { id = result.Value.Id }, result.Value);
}
```

---

## 3. Resource-Based Authorization (ABAC in C#)

When permission depends on the specific entity being manipulated (e.g., "A user can edit an invoice only if it is in Draft status and belongs to their department"):

```csharp
public class InvoiceAuthorizationHandler : AuthorizationHandler<SameAuthorRequirement, Invoice>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        SameAuthorRequirement requirement,
        Invoice resource)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (resource.CreatedByUserId == userId && resource.Status == InvoiceStatus.Draft)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

// Controller consumption:
var invoice = await _context.Invoices.FindAsync(id);
var authResult = await _authorizationService.AuthorizeAsync(User, invoice, new SameAuthorRequirement());

if (!authResult.Succeeded)
{
    return Forbid();
}
```
