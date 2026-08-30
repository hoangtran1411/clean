namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowRequestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequestedByUserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CurrentApprovalLevel { get; set; }
    public int TotalApprovalLevels { get; set; }
    public string? CurrentLevelName { get; set; }
    public string? RejectionReason { get; set; }
    public string? ObsolescenceReason { get; set; }
    public string? ObsoletedByUserName { get; set; }
    public DateTime? ObsoletedAtUtc { get; set; }
    public DateTime? ApprovedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string WorkflowTemplateName { get; set; } = string.Empty;
    public List<WorkflowApprovalActionDto> History { get; set; } = [];
}
