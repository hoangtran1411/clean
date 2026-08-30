using CleanArch.Domain.Common;
using CleanArch.Domain.Enums;

namespace CleanArch.Domain.Entities;

public class WorkflowHistory : BaseEntity
{
    public int WorkflowRequestId { get; set; }
    public WorkflowStatus FromStatus { get; set; }
    public WorkflowStatus ToStatus { get; set; }
    public string ChangedByUserId { get; set; } = string.Empty;
    public string ChangedByUserName { get; set; } = string.Empty;
    public string? Comment { get; set; }
}
