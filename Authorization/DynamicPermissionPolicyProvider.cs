using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace IdentityJwtDemo.Authorization;

/// <summary>
/// Dynamic Authorization Policy Provider that intercepts policy lookups.
/// Whenever an endpoint specifies a policy starting with "Permission:",
/// this provider dynamically generates an AuthorizationPolicy with the matching PermissionRequirement.
/// </summary>
public class DynamicPermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public const string PolicyPrefix = "Permission:";

    public DynamicPermissionPolicyProvider(IOptions<AuthorizationOptions> options) 
        : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        // 1. Check if the requested policy matches the dynamic permission format
        if (policyName.StartsWith(PolicyPrefix, StringComparison.OrdinalIgnoreCase))
        {
            var permission = policyName[PolicyPrefix.Length..];
            
            // Dynamically construct an AuthorizationPolicy with our custom PermissionRequirement
            var policy = new AuthorizationPolicyBuilder();
            policy.AddRequirements(new PermissionRequirement(permission));
            return policy.Build();
        }

        // 2. Fall back to default provider for static policies registered in Program.cs
        return await base.GetPolicyAsync(policyName);
    }
}
