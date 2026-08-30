using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.ApproveWorkflowLevel;

public record ApproveWorkflowLevelCommand(int Id, string? Comment) : IRequest<Result<WorkflowRequestDto>>;

public class ApproveWorkflowLevelCommandHandler : IRequestHandler<ApproveWorkflowLevelCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveWorkflowLevelCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(ApproveWorkflowLevelCommand request, CancellationToken cancellationToken)
    {
        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.Template)
            .ThenInclude(t => t.ApprovalLevels)
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
        if (wfRequest == null) throw new NotFoundException("WorkflowRequest", request.Id);

        var currentLevel = wfRequest.Template.ApprovalLevels.FirstOrDefault(x => x.LevelOrder == wfRequest.CurrentApprovalLevel);
        if (currentLevel != null && !_currentUserService.HasPermission(currentLevel.RequiredPermission))
            throw new ForbiddenException($"You do not have the required permission: {currentLevel.RequiredPermission}");

        wfRequest.ApproveCurrentLevel(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty, request.Comment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
