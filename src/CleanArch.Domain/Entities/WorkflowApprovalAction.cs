using CleanArch.Domain.Common;
using CleanArch.Domain.Enums;

namespace CleanArch.Domain.Entities;

public class WorkflowApprovalAction : BaseEntity
{
    public int WorkflowRequestId { get; set; }
    public WorkflowRequest Request { get; set; } = null!;
    public int ApprovalLevel { get; set; }
    public WorkflowAction Action { get; set; }
    public string ActedByUserId { get; set; } = string.Empty;
    public string ActedByUserName { get; set; } = string.Empty;
    public string? Comment { get; set; }
}
