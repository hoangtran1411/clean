namespace CleanArch.Application.Common.Models;

public class AuthResponse
{
    public bool IsSuccess { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public List<string> Roles { get; set; } = [];
    public List<string> Permissions { get; set; } = [];
}
