using Microsoft.AspNetCore.Identity;

namespace IdentityJwtDemo.Models;

/// <summary>
/// ApplicationUser extends the default IdentityUser provided by ASP.NET Core Identity.
/// It inherits properties like Id, UserName, Email, PasswordHash, PhoneNumber, etc.,
/// and allows you to add custom domain properties.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Refresh Token fields for persistent JWT token rotation
    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }
}
