namespace CleanArch.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? UserName { get; }
    bool IsAuthenticated { get; }
    bool HasPermission(string permission);
}
