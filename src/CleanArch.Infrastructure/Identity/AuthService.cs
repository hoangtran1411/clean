using System.Security.Claims;
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Domain.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace CleanArch.Infrastructure.Identity;

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

    public async Task<AuthResponse> RegisterAsync(string fullName, string email, string password)
    {
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            return new AuthResponse
            {
                IsSuccess = false,
                Message = "User with this email already exists."
            };
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new AuthResponse
            {
                IsSuccess = false,
                Message = $"Registration failed: {errors}"
            };
        }

        if (await _roleManager.RoleExistsAsync(UserRoles.User))
        {
            await _userManager.AddToRoleAsync(user, UserRoles.User);
        }
        await _userManager.AddClaimAsync(user, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (token, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(
            user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, user.FullName, roles, customClaims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
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

    public async Task<AuthResponse> LoginAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return new AuthResponse { IsSuccess = false, Message = "Invalid email or password." };
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isPasswordValid)
        {
            return new AuthResponse { IsSuccess = false, Message = "Invalid email or password." };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (token, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(
            user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, user.FullName, roles, customClaims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
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

    public async Task<AuthResponse> RefreshTokenAsync(string accessToken, string refreshToken)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return new AuthResponse { IsSuccess = false, Message = "Invalid access token." };
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return new AuthResponse { IsSuccess = false, Message = "Invalid token payload." };
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || 
            user.RefreshToken != refreshToken || 
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return new AuthResponse { IsSuccess = false, Message = "Invalid or expired refresh token." };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var customClaims = await _userManager.GetClaimsAsync(user);
        var (newToken, expiresAtUtc) = await _tokenService.GenerateAccessTokenAsync(
            user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, user.FullName, roles, customClaims);
        
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshExpiryDays = double.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays);
        await _userManager.UpdateAsync(user);

        return new AuthResponse
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

    public async Task<bool> AssignRoleAsync(string email, string role)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole(role));
        }

        var result = await _userManager.AddToRoleAsync(user, role);
        return result.Succeeded;
    }

    public async Task<bool> GrantPermissionAsync(string email, string permission)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        var existingClaims = await _userManager.GetClaimsAsync(user);
        if (existingClaims.Any(c => c.Type == AppPermissions.ClaimType && c.Value == permission))
        {
            return true;
        }

        var result = await _userManager.AddClaimAsync(user, new Claim(AppPermissions.ClaimType, permission));
        return result.Succeeded;
    }

    public async Task<UserProfileData?> GetUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var claims = await _userManager.GetClaimsAsync(user);
        var permissions = claims
            .Where(c => c.Type == AppPermissions.ClaimType)
            .Select(c => c.Value)
            .ToList();

        return new UserProfileData
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt,
            Roles = roles.ToList(),
            Permissions = permissions
        };
    }
}
