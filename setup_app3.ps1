$appDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Application\Features\Workflows"

Set-Content -Path "$appDir\Commands\RejectWorkflow\RejectWorkflowCommand.cs" -Value @"
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.RejectWorkflow;

public record RejectWorkflowCommand(int Id, string RejectionReason) : IRequest<Result<WorkflowRequestDto>>;

public class RejectWorkflowCommandHandler : IRequestHandler<RejectWorkflowCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public RejectWorkflowCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(RejectWorkflowCommand request, CancellationToken cancellationToken)
    {
        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.Template)
            .ThenInclude(t => t.ApprovalLevels)
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
        if (wfRequest == null) throw new NotFoundException(""WorkflowRequest"", request.Id);

        var currentLevel = wfRequest.Template.ApprovalLevels.FirstOrDefault(x => x.LevelOrder == wfRequest.CurrentApprovalLevel);
        bool hasLevelPerm = currentLevel != null && _currentUserService.HasPermission(currentLevel.RequiredPermission);
        bool hasRejectPerm = _currentUserService.HasPermission(AppPermissions.WorkflowsReject);

        if (!hasLevelPerm && !hasRejectPerm)
            throw new ForbiddenException(""You do not have permission to reject this workflow."");

        wfRequest.Reject(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty, request.RejectionReason);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
"@

Set-Content -Path "$appDir\Commands\CompleteWorkflow\CompleteWorkflowCommand.cs" -Value @"
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.CompleteWorkflow;

public record CompleteWorkflowCommand(int Id) : IRequest<Result<WorkflowRequestDto>>;

public class CompleteWorkflowCommandHandler : IRequestHandler<CompleteWorkflowCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CompleteWorkflowCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(CompleteWorkflowCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.HasPermission(AppPermissions.WorkflowsComplete))
            throw new ForbiddenException();

        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
        if (wfRequest == null) throw new NotFoundException(""WorkflowRequest"", request.Id);

        wfRequest.Complete(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
"@
