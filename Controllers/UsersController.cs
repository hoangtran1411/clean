using System.Security.Claims;
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityJwtDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    /// <summary>
    /// Public endpoint - No authentication required.
    /// </summary>
    [HttpGet("public-info")]
    [AllowAnonymous]
    public IActionResult GetPublicInfo()
    {
        return Ok(new
        {
            message = "This endpoint is public and accessible without a token.",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Authenticated endpoint - Requires ANY valid JWT Bearer token.
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUserProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.FullName,
            user.CreatedAt,
            Roles = roles,
            Claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }

    /// <summary>
    /// Role-Protected endpoint - Accessible ONLY by users with the 'Admin' role.
    /// </summary>
    [HttpGet("admin-dashboard")]
    [Authorize(Roles = UserRoles.Admin)]
    public IActionResult GetAdminDashboard()
    {
        return Ok(new
        {
            message = "Welcome Admin! You have access to confidential administrative resources.",
            accessedBy = User.Identity?.Name,
            accessedAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Multi-Role Protected endpoint - Accessible by 'Admin' OR 'Manager'.
    /// </summary>
    [HttpGet("management-reports")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Manager}")]
    public IActionResult GetManagementReports()
    {
        return Ok(new
        {
            message = "Accessible by Admins and Managers only.",
            user = User.Identity?.Name
        });
    }
}
