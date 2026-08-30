using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class WorkflowTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public IList<WorkflowApprovalLevel> ApprovalLevels { get; private set; } = [];
    public IList<WorkflowRequest> Requests { get; private set; } = [];
}
