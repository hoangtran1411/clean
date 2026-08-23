using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace CleanArch.WebApi.Authorization;

public class DynamicPermissionPolicyProvider : DefaultAuthorizationPolicyProvider
{
    public const string PolicyPrefix = "Permission:";

    public DynamicPermissionPolicyProvider(IOptions<AuthorizationOptions> options)
        : base(options)
    {
    }

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
