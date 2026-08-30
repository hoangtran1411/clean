$appDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Application\Features\Workflows"

Set-Content -Path "$appDir\Queries\GetWorkflowTemplates\GetWorkflowTemplatesQuery.cs" -Value @"
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using MediatR;

namespace CleanArch.Application.Features.Workflows.Queries.GetWorkflowTemplates;

public record GetWorkflowTemplatesQuery() : IRequest<Result<List<WorkflowTemplateDto>>>;

public class GetWorkflowTemplatesQueryHandler : IRequestHandler<GetWorkflowTemplatesQuery, Result<List<WorkflowTemplateDto>>>
{
    public Task<Result<List<WorkflowTemplateDto>>> Handle(GetWorkflowTemplatesQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Result<List<WorkflowTemplateDto>>.Success(new List<WorkflowTemplateDto>()));
    }
}
"@

Set-Content -Path "$appDir\Queries\GetWorkflowRequestById\GetWorkflowRequestByIdQuery.cs" -Value @"
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
"@

Set-Content -Path "$appDir\Queries\GetWorkflowRequests\GetWorkflowRequestsQuery.cs" -Value @"
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
"@
