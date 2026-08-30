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

        return Result<WorkflowTemplateDto>.Success(new WorkflowTemplateDto
        {
            Id = template.Id,
            Name = template.Name,
            Description = template.Description,
            IsActive = template.IsActive,
            ApprovalLevels = template.ApprovalLevels.Select(l => new WorkflowApprovalLevelDto
            {
                Id = l.Id,
                LevelOrder = l.LevelOrder,
                LevelName = l.LevelName,
                RequiredPermission = l.RequiredPermission
            }).ToList()
        });
    }
}
