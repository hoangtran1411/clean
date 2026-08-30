using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class WorkflowApprovalLevel : BaseEntity
{
    public int WorkflowTemplateId { get; set; }
    public WorkflowTemplate Template { get; set; } = null!;
    public int LevelOrder { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string RequiredPermission { get; set; } = string.Empty;
}
