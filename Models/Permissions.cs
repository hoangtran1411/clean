namespace IdentityJwtDemo.Models;

/// <summary>
/// Predefined granular system permissions.
/// These permissions can be attached as Claims to Users or Roles.
/// </summary>
public static class AppPermissions
{
    public const string ClaimType = "Permission";

    public const string UsersView = "Users.View";
    public const string UsersCreate = "Users.Create";
    public const string UsersEdit = "Users.Edit";
    public const string UsersDelete = "Users.Delete";

    public const string ReportsView = "Reports.View";
    public const string ReportsExport = "Reports.Export";

    public static readonly string[] AllPermissions =
    [
        UsersView,
        UsersCreate,
        UsersEdit,
        UsersDelete,
        ReportsView,
        ReportsExport
    ];
}
