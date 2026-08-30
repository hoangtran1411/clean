using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft;

public record ResetWorkflowToDraftCommand(int Id, string Reason) : IRequest<Result<WorkflowRequestDto>>;

public class ResetWorkflowToDraftCommandHandler : IRequestHandler<ResetWorkflowToDraftCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ResetWorkflowToDraftCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(ResetWorkflowToDraftCommand request, CancellationToken cancellationToken)
    {
        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.Template)
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (wfRequest == null)
            throw new NotFoundException("WorkflowRequest", request.Id);

        // Highest permission required to revoke signatures and reset to draft
        if (!_currentUserService.HasPermission(AppPermissions.WorkflowsResetToDraft))
            throw new ForbiddenException("You do not possess the highest administrative permission ('Workflows.ResetToDraft') required to revoke signatures and reset this workflow to Draft.");

        wfRequest.ResetToDraft(
            _currentUserService.UserId ?? string.Empty,
            _currentUserService.UserName ?? string.Empty,
            request.Reason);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto
        {
            Id = wfRequest.Id,
            Status = wfRequest.Status.ToString(),
            CurrentApprovalLevel = wfRequest.CurrentApprovalLevel,
            TotalApprovalLevels = wfRequest.TotalApprovalLevels
        });
    }
}
