using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.ObsoleteWorkflow;

public record ObsoleteWorkflowCommand(int Id, string ObsolescenceReason) : IRequest<Result<WorkflowRequestDto>>;

public class ObsoleteWorkflowCommandHandler : IRequestHandler<ObsoleteWorkflowCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ObsoleteWorkflowCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(ObsoleteWorkflowCommand request, CancellationToken cancellationToken)
    {
        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.Template)
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (wfRequest == null)
            throw new NotFoundException("WorkflowRequest", request.Id);

        bool isCreator = wfRequest.RequestedByUserId == _currentUserService.UserId;
        bool hasObsoletePerm = _currentUserService.HasPermission(AppPermissions.WorkflowsObsolete);

        if (!isCreator && !hasObsoletePerm)
            throw new ForbiddenException("You do not have permission to mark this workflow as obsolete.");

        wfRequest.MarkObsolete(
            _currentUserService.UserId ?? string.Empty,
            _currentUserService.UserName ?? string.Empty,
            request.ObsolescenceReason);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto
        {
            Id = wfRequest.Id,
            Status = wfRequest.Status.ToString(),
            ObsolescenceReason = wfRequest.ObsolescenceReason,
            ObsoletedByUserName = wfRequest.ObsoletedByUserName,
            ObsoletedAtUtc = wfRequest.ObsoletedAtUtc
        });
    }
}
