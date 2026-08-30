namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowApprovalActionDto
{
    public int Id { get; set; }
    public int ApprovalLevel { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActedByUserName { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
