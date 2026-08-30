namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowRequestSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int CurrentApprovalLevel { get; set; }
    public int TotalApprovalLevels { get; set; }
    public string RequestedByUserName { get; set; } = string.Empty;
    public string WorkflowTemplateName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
