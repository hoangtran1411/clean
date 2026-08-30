using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequestById;

public record GetWorkflowRequestByIdQuery(int Id) : IRequest<Result<WorkflowRequestDto>>;

public class GetWorkflowRequestByIdQueryHandler : IRequestHandler<GetWorkflowRequestByIdQuery, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;

    public GetWorkflowRequestByIdQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(GetWorkflowRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.WorkflowRequests
            .Include(x => x.Template)
            .ThenInclude(t => t.ApprovalLevels)
            .Include(x => x.ApprovalActions)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException("WorkflowRequest", request.Id);

        var currentLevel = entity.Template.ApprovalLevels
            .FirstOrDefault(l => l.LevelOrder == entity.CurrentApprovalLevel);

        var dto = new WorkflowRequestDto
        {
            Id = entity.Id,
            Title = entity.Title,
            Description = entity.Description,
            RequestedByUserName = entity.RequestedByUserName,
            Status = entity.Status.ToString(),
            CurrentApprovalLevel = entity.CurrentApprovalLevel,
            TotalApprovalLevels = entity.TotalApprovalLevels,
            CurrentLevelName = currentLevel?.LevelName,
            RejectionReason = entity.RejectionReason,
            ObsolescenceReason = entity.ObsolescenceReason,
            ObsoletedByUserName = entity.ObsoletedByUserName,
            ObsoletedAtUtc = entity.ObsoletedAtUtc,
            ApprovedAtUtc = entity.ApprovedAtUtc,
            CompletedAtUtc = entity.CompletedAtUtc,
            CreatedAtUtc = entity.CreatedAtUtc,
            WorkflowTemplateName = entity.Template.Name,
            History = entity.ApprovalActions
                .OrderBy(a => a.CreatedAtUtc)
                .Select(a => new WorkflowApprovalActionDto
                {
                    Id = a.Id,
                    ApprovalLevel = a.ApprovalLevel,
                    Action = a.Action.ToString(),
                    ActedByUserName = a.ActedByUserName,
                    Comment = a.Comment,
                    CreatedAtUtc = a.CreatedAtUtc
                }).ToList()
        };

        return Result<WorkflowRequestDto>.Success(dto);
    }
}
