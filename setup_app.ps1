$appDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Application\Features\Workflows"

New-Item -ItemType Directory -Force -Path "$appDir\DTOs"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\CreateWorkflowTemplate"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\CreateWorkflowRequest"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\SubmitWorkflowRequest"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\ApproveWorkflowLevel"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\RejectWorkflow"
New-Item -ItemType Directory -Force -Path "$appDir\Commands\CompleteWorkflow"
New-Item -ItemType Directory -Force -Path "$appDir\Queries\GetWorkflowTemplates"
New-Item -ItemType Directory -Force -Path "$appDir\Queries\GetWorkflowRequestById"
New-Item -ItemType Directory -Force -Path "$appDir\Queries\GetWorkflowRequests"

Set-Content -Path "$appDir\DTOs\WorkflowApprovalLevelDto.cs" -Value @"
namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowApprovalLevelDto
{
    public int Id { get; set; }
    public int LevelOrder { get; set; }
    public string LevelName { get; set; } = string.Empty;
    public string RequiredPermission { get; set; } = string.Empty;
}
"@

Set-Content -Path "$appDir\DTOs\WorkflowTemplateDto.cs" -Value @"
namespace CleanArch.Application.Features.Workflows.DTOs;

public class WorkflowTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public List<WorkflowApprovalLevelDto> ApprovalLevels { get; set; } = [];
}
"@

Set-Content -Path "$appDir\DTOs\WorkflowApprovalActionDto.cs" -Value @"
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
"@

Set-Content -Path "$appDir\DTOs\WorkflowRequestDto.cs" -Value @"
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
    public DateTime? ApprovedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string WorkflowTemplateName { get; set; } = string.Empty;
    public List<WorkflowApprovalActionDto> History { get; set; } = [];
}
"@

Set-Content -Path "$appDir\DTOs\WorkflowRequestSummaryDto.cs" -Value @"
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
"@

Set-Content -Path "$appDir\Commands\CreateWorkflowTemplate\CreateWorkflowTemplateCommand.cs" -Value @"
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Entities;
using CleanArch.Domain.Exceptions;
using MediatR;

namespace CleanArch.Application.Features.Workflows.Commands.CreateWorkflowTemplate;

public record CreateApprovalLevelRequest(int LevelOrder, string LevelName, string RequiredPermission);
public record CreateWorkflowTemplateCommand(string Name, string Description, List<CreateApprovalLevelRequest> ApprovalLevels) : IRequest<Result<WorkflowTemplateDto>>;

public class CreateWorkflowTemplateCommandHandler : IRequestHandler<CreateWorkflowTemplateCommand, Result<WorkflowTemplateDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateWorkflowTemplateCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowTemplateDto>> Handle(CreateWorkflowTemplateCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.HasPermission(AppPermissions.WorkflowsManageTemplates))
            throw new ForbiddenException();

        var template = new WorkflowTemplate
        {
            Name = request.Name,
            Description = request.Description,
            IsActive = true
        };

        foreach (var level in request.ApprovalLevels.OrderBy(x => x.LevelOrder))
        {
            template.ApprovalLevels.Add(new WorkflowApprovalLevel
            {
                LevelOrder = level.LevelOrder,
                LevelName = level.LevelName,
                RequiredPermission = level.RequiredPermission
            });
        }

        _context.WorkflowTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowTemplateDto>.Success(new WorkflowTemplateDto { Id = template.Id, Name = template.Name });
    }
}
"@
