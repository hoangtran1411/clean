namespace CleanArch.Domain.Constants;

public static class AppPermissions
{
    public const string ClaimType = "Permission";

    public const string UsersView = "Users.View";
    public const string UsersCreate = "Users.Create";
    public const string UsersEdit = "Users.Edit";
    public const string UsersDelete = "Users.Delete";

    public const string ReportsView = "Reports.View";
    public const string ReportsExport = "Reports.Export";

    public const string WorkflowsView = "Workflows.View";
    public const string WorkflowsCreate = "Workflows.Create";
    public const string WorkflowsSubmit = "Workflows.Submit";
    public const string WorkflowsManageTemplates = "Workflows.ManageTemplates";
    public const string WorkflowsReject = "Workflows.Reject";
    public const string WorkflowsComplete = "Workflows.Complete";

    public const string WorkflowsApproveTeamLeader = "Workflows.Approve.TeamLeader";
    public const string WorkflowsApproveDepartmentHead = "Workflows.Approve.DepartmentHead";
    public const string WorkflowsApproveDeputyDirector = "Workflows.Approve.DeputyDirector";
    public const string WorkflowsApproveTechnicalDirector = "Workflows.Approve.TechnicalDirector";

    public static readonly string[] AllPermissions =
    [
        UsersView,
        UsersCreate,
        UsersEdit,
        UsersDelete,
        ReportsView,
        ReportsExport,
        WorkflowsView,
        WorkflowsCreate,
        WorkflowsSubmit,
        WorkflowsManageTemplates,
        WorkflowsReject,
        WorkflowsComplete,
        WorkflowsApproveTeamLeader,
        WorkflowsApproveDepartmentHead,
        WorkflowsApproveDeputyDirector,
        WorkflowsApproveTechnicalDirector
    ];
}
