using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using MediatR;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequestById;

public record GetWorkflowRequestByIdQuery(int Id) : IRequest<Result<WorkflowRequestDto>>;

public class GetWorkflowRequestByIdQueryHandler : IRequestHandler<GetWorkflowRequestByIdQuery, Result<WorkflowRequestDto>>
{
    public Task<Result<WorkflowRequestDto>> Handle(GetWorkflowRequestByIdQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = request.Id }));
    }
}
