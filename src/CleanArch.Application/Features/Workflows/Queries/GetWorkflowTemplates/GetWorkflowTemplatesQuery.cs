using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowTemplates;

public record GetWorkflowTemplatesQuery() : IRequest<Result<List<WorkflowTemplateDto>>>;

public class GetWorkflowTemplatesQueryHandler : IRequestHandler<GetWorkflowTemplatesQuery, Result<List<WorkflowTemplateDto>>>
{
    private readonly IAppDbContext _context;

    public GetWorkflowTemplatesQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<WorkflowTemplateDto>>> Handle(GetWorkflowTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _context.WorkflowTemplates
            .Include(t => t.ApprovalLevels)
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .Select(t => new WorkflowTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                IsActive = t.IsActive,
                ApprovalLevels = t.ApprovalLevels
                    .OrderBy(l => l.LevelOrder)
                    .Select(l => new WorkflowApprovalLevelDto
                    {
                        Id = l.Id,
                        LevelOrder = l.LevelOrder,
                        LevelName = l.LevelName,
                        RequiredPermission = l.RequiredPermission
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Result<List<WorkflowTemplateDto>>.Success(templates);
    }
}
