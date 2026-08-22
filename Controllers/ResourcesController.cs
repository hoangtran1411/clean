using IdentityJwtDemo.Authorization;
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Mvc;

namespace IdentityJwtDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    /// <summary>
    /// Requires dynamic permission: 'Users.View'
    /// Accessible by: Admin (full bypass), Manager, Standard User.
    /// </summary>
    [HttpGet("users-list")]
    [HasPermission(AppPermissions.UsersView)]
    public IActionResult GetUsersList()
    {
        return Ok(new
        {
            message = "Access granted to view users list.",
            requiredPermission = AppPermissions.UsersView,
            accessedBy = User.Identity?.Name
        });
    }

    /// <summary>
    /// Requires dynamic permission: 'Users.Create'
    /// Accessible by: Admin (or users explicitly granted 'Users.Create').
    /// </summary>
    [HttpPost("create-user-record")]
    [HasPermission(AppPermissions.UsersCreate)]
    public IActionResult CreateUserRecord()
    {
        return Ok(new
        {
            message = "Access granted to create user records.",
            requiredPermission = AppPermissions.UsersCreate,
            accessedBy = User.Identity?.Name
        });
    }

    /// <summary>
    /// Requires dynamic permission: 'Users.Delete'
    /// Accessible by: Admin (or users explicitly granted 'Users.Delete').
    /// </summary>
    [HttpDelete("delete-user-record/{id}")]
    [HasPermission(AppPermissions.UsersDelete)]
    public IActionResult DeleteUserRecord(string id)
    {
        return Ok(new
        {
            message = $"Access granted to delete user record {id}.",
            requiredPermission = AppPermissions.UsersDelete,
            accessedBy = User.Identity?.Name
        });
    }

    /// <summary>
    /// Requires dynamic permission: 'Reports.Export'
    /// Accessible by: Admin, Manager.
    /// </summary>
    [HttpGet("export-financial-report")]
    [HasPermission(AppPermissions.ReportsExport)]
    public IActionResult ExportFinancialReport()
    {
        return Ok(new
        {
            message = "Access granted to export financial report data.",
            requiredPermission = AppPermissions.ReportsExport,
            accessedBy = User.Identity?.Name
        });
    }
}
