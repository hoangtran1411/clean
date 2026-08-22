using System.Security.Claims;
using IdentityJwtDemo.Models;

namespace IdentityJwtDemo.Services;

public interface ITokenService
{
    /// <summary>
    /// Generates a signed JWT Access Token containing user claims and roles.
    /// </summary>
    Task<(string Token, DateTime ExpiresAtUtc)> GenerateAccessTokenAsync(ApplicationUser user, IList<string> roles, IList<Claim>? customClaims = null);

    /// <summary>
    /// Generates a cryptographically secure random refresh token string.
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// Validates an expired token's signature without rejecting it for expiration,
    /// extracting the claims principal so we can identify the user during token refresh.
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
