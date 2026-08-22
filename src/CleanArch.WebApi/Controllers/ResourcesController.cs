using CleanArch.Domain.Constants;
using CleanArch.WebApi.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

public class ResourcesController : ApiControllerBase
{
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
