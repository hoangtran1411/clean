using CleanArch.Application.Common.Models;

namespace CleanArch.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(string fullName, string email, string password);
    Task<AuthResponse> LoginAsync(string email, string password);
    Task<AuthResponse> RefreshTokenAsync(string accessToken, string refreshToken);
    Task<bool> RevokeTokenAsync(string email);
    Task<bool> AssignRoleAsync(string email, string role);
    Task<bool> GrantPermissionAsync(string email, string permission);
    Task<UserProfileData?> GetUserProfileAsync(string userId);
}

public class UserProfileData
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<string> Roles { get; set; } = [];
    public List<string> Permissions { get; set; } = [];
}
