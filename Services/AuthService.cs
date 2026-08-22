using System.Security.Claims;
using IdentityJwtDemo.DTOs;
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Identity;

namespace IdentityJwtDemo.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "User with this email already exists."
            };
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = $"User registration failed: {errors}"
            };
        }

        // Assign default User role and default claim
        if (await _roleManager.RoleExistsAsync(UserRoles.User))
        {
            await _userManager.AddToRoleAsync(user, UserRoles.User);
        }
        await _userManager.AddClaimAsync(user, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (token, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(user, roles, customClaims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "User registered successfully.",
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles.ToList()
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid email or password."
            };
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid email or password."
            };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (token, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(user, roles, customClaims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Login successful.",
            AccessToken = token,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles.ToList()
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
        if (principal == null)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid access token or token signature."
            };
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid token payload: missing user identifier."
            };
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || 
            user.RefreshToken != dto.RefreshToken || 
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return new AuthResponseDto
            {
                IsSuccess = false,
                Message = "Invalid or expired refresh token. Please log in again."
            };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (newToken, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(user, roles, customClaims);
        
        // Rotate refresh token for security
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Token refreshed successfully.",
            AccessToken = newToken,
            RefreshToken = newRefreshToken,
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Roles = roles.ToList()
        };
    }

    public async Task<bool> RevokeTokenAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> AssignRoleAsync(AssignRoleDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return false;

        if (!await _roleManager.RoleExistsAsync(dto.Role))
        {
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));
        }

        var result = await _userManager.AddToRoleAsync(user, dto.Role);
        return result.Succeeded;
    }

    public async Task<bool> GrantPermissionAsync(string email, string permission)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        var existingClaims = await _userManager.GetClaimsAsync(user);
        if (existingClaims.Any(c => c.Type == AppPermissions.ClaimType && c.Value == permission))
        {
            return true; // already granted
        }

        var result = await _userManager.AddClaimAsync(user, new Claim(AppPermissions.ClaimType, permission));
        return result.Succeeded;
    }
}
