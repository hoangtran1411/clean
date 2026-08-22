using System.Security.Claims;
using CleanArch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CleanArch.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? Email => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);
    public string? UserName => _httpContextAccessor.HttpContext?.User.Identity?.Name;
    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
