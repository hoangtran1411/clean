using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Entities;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.CreateWorkflowRequest;

public record CreateWorkflowRequestCommand(int WorkflowTemplateId, string Title, string Description) : IRequest<Result<WorkflowRequestDto>>;

public class CreateWorkflowRequestCommandHandler : IRequestHandler<CreateWorkflowRequestCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateWorkflowRequestCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(CreateWorkflowRequestCommand request, CancellationToken cancellationToken)
    {
        var template = await _context.WorkflowTemplates
            .Include(x => x.ApprovalLevels)
            .FirstOrDefaultAsync(x => x.Id == request.WorkflowTemplateId, cancellationToken);
            
        if (template == null || !template.IsActive)
            throw new NotFoundException("WorkflowTemplate", request.WorkflowTemplateId);

        var wfRequest = new WorkflowRequest
        {
            WorkflowTemplateId = template.Id,
            Title = request.Title,
            Description = request.Description,
            RequestedByUserId = _currentUserService.UserId ?? string.Empty,
            RequestedByUserName = _currentUserService.UserName ?? string.Empty,
            TotalApprovalLevels = template.ApprovalLevels.Count
        };

        _context.WorkflowRequests.Add(wfRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id, Title = wfRequest.Title });
    }
}
