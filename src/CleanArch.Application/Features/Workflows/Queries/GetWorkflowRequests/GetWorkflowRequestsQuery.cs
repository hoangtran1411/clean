using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Enums;
using MediatR;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequests;

public record GetWorkflowRequestsQuery(WorkflowStatus? Status = null) : IRequest<Result<List<WorkflowRequestSummaryDto>>>;

public class GetWorkflowRequestsQueryHandler : IRequestHandler<GetWorkflowRequestsQuery, Result<List<WorkflowRequestSummaryDto>>>
{
    public Task<Result<List<WorkflowRequestSummaryDto>>> Handle(GetWorkflowRequestsQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Result<List<WorkflowRequestSummaryDto>>.Success(new List<WorkflowRequestSummaryDto>()));
    }
}
