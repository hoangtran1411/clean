using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Authorization;

namespace IdentityJwtDemo.Authorization;

/// <summary>
/// Authorization Handler that evaluates whether a user satisfies a given PermissionRequirement.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        // 1. If user is unauthenticated, fail early
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        // 2. Super-admin override: Admins automatically have all permissions
        if (context.User.IsInRole(UserRoles.Admin))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // 3. Check if user's claims contain the required permission
        var hasPermission = context.User.Claims.Any(c =>
            string.Equals(c.Type, AppPermissions.ClaimType, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(c.Value, requirement.Permission, StringComparison.OrdinalIgnoreCase));

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
