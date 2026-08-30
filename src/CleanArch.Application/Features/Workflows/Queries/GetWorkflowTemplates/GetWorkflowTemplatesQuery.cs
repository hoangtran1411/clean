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
