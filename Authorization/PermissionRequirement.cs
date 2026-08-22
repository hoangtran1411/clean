using Microsoft.AspNetCore.Authorization;

namespace IdentityJwtDemo.Authorization;

/// <summary>
/// An Authorization Requirement representing a specific granular permission.
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission ?? throw new ArgumentNullException(nameof(permission));
    }
}
