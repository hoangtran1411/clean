using Microsoft.AspNetCore.Authorization;

namespace IdentityJwtDemo.Authorization;

/// <summary>
/// Custom declarative attribute for securing controllers or actions with dynamic permissions.
/// Usage: [HasPermission(AppPermissions.UsersDelete)] or [HasPermission("Orders.Refund")]
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(string permission)
        : base(policy: $"{DynamicPermissionPolicyProvider.PolicyPrefix}{permission}")
    {
    }
}
