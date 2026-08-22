using System.Security.Claims;

namespace CleanArch.Application.Common.Interfaces;

public interface ITokenService
{
    Task<(string Token, DateTime ExpiresAtUtc)> GenerateAccessTokenAsync(
        string userId,
        string userName,
        string email,
        string fullName,
        IList<string> roles,
        IList<Claim>? customClaims = null);

    string GenerateRefreshToken();

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
