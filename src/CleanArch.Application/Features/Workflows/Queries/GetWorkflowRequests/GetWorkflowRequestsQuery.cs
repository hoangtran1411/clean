using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequests;

public record GetWorkflowRequestsQuery(WorkflowStatus? Status = null) : IRequest<Result<List<WorkflowRequestSummaryDto>>>;

public class GetWorkflowRequestsQueryHandler : IRequestHandler<GetWorkflowRequestsQuery, Result<List<WorkflowRequestSummaryDto>>>
{
    private readonly IAppDbContext _context;

    public GetWorkflowRequestsQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<WorkflowRequestSummaryDto>>> Handle(GetWorkflowRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WorkflowRequests
            .Include(x => x.Template)
            .AsNoTracking();

        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        var list = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => new WorkflowRequestSummaryDto
            {
                Id = x.Id,
                Title = x.Title,
                Status = x.Status.ToString(),
                CurrentApprovalLevel = x.CurrentApprovalLevel,
                TotalApprovalLevels = x.TotalApprovalLevels,
                RequestedByUserName = x.RequestedByUserName,
                WorkflowTemplateName = x.Template.Name,
                CreatedAtUtc = x.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return Result<List<WorkflowRequestSummaryDto>>.Success(list);
    }
}
