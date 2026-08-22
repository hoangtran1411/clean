using CleanArch.Domain.Constants;
using Microsoft.AspNetCore.Authorization;

namespace CleanArch.WebApi.Authorization;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        // Super-admin override
        if (context.User.IsInRole(UserRoles.Admin))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

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
