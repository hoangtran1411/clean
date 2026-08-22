using System.Security.Claims;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Users.Queries.GetUserProfile;
using CleanArch.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

public class UsersController : ApiControllerBase
{
    [HttpGet("public-info")]
    [AllowAnonymous]
    public IActionResult GetPublicInfo()
    {
        return Ok(new
        {
            message = "This endpoint is public and accessible without authentication.",
            timestamp = DateTime.UtcNow
        });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await Mediator.Send(new GetUserProfileQuery(userId));
        return result.Succeeded ? Ok(result.Data) : NotFound(result.Message);
    }

    [HttpGet("admin-dashboard")]
    [Authorize(Roles = UserRoles.Admin)]
    public IActionResult GetAdminDashboard()
    {
        return Ok(new
        {
            message = "Welcome Super Admin! Confidential administration dashboard.",
            accessedBy = User.Identity?.Name,
            accessedAt = DateTime.UtcNow
        });
    }

    [HttpGet("management-reports")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Manager}")]
    public IActionResult GetManagementReports()
    {
        return Ok(new
        {
            message = "Confidential management analytics dashboard.",
            accessedBy = User.Identity?.Name
        });
    }
}
