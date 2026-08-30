namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<WorkflowApprovalLevelDto> ApprovalLevels { get; set; } = [];
}
