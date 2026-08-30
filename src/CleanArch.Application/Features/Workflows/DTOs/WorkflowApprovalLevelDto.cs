namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowApprovalLevelDto
{
    public int Id { get; set; }
    public int LevelOrder { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string RequiredPermission { get; set; } = string.Empty;
}
