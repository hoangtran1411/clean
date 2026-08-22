using IdentityJwtDemo.DTOs;

namespace IdentityJwtDemo.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<bool> RevokeTokenAsync(string email);
    Task<bool> AssignRoleAsync(AssignRoleDto dto);
    Task<bool> GrantPermissionAsync(string email, string permission);
}
