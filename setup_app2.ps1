$appDir = "C:\Users\Hoang\Desktop\clean\src\CleanArch.Application\Features\Workflows"

Set-Content -Path "$appDir\Commands\CreateWorkflowRequest\CreateWorkflowRequestCommand.cs" -Value @"
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
            throw new NotFoundException(""WorkflowTemplate"", request.WorkflowTemplateId);

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
"@

Set-Content -Path "$appDir\Commands\SubmitWorkflowRequest\SubmitWorkflowRequestCommand.cs" -Value @"
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Workflows.DTOs;
using CleanArch.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Workflows.Commands.SubmitWorkflowRequest;

public record SubmitWorkflowRequestCommand(int Id) : IRequest<Result<WorkflowRequestDto>>;

public class SubmitWorkflowRequestCommandHandler : IRequestHandler<SubmitWorkflowRequestCommand, Result<WorkflowRequestDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public SubmitWorkflowRequestCommandHandler(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<WorkflowRequestDto>> Handle(SubmitWorkflowRequestCommand request, CancellationToken cancellationToken)
    {
        var wfRequest = await _context.WorkflowRequests
            .Include(x => x.ApprovalActions)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
            
        if (wfRequest == null) throw new NotFoundException(""WorkflowRequest"", request.Id);

        wfRequest.Submit(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
"@

Set-Content -Path "$appDir\Commands\ApproveWorkflowLevel\ApproveWorkflowLevelCommand.cs" -Value @"
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
            
        if (wfRequest == null) throw new NotFoundException(""WorkflowRequest"", request.Id);

        var currentLevel = wfRequest.Template.ApprovalLevels.FirstOrDefault(x => x.LevelOrder == wfRequest.CurrentApprovalLevel);
        if (currentLevel != null && !_currentUserService.HasPermission(currentLevel.RequiredPermission))
            throw new ForbiddenException($""You do not have the required permission: {currentLevel.RequiredPermission}"");

        wfRequest.ApproveCurrentLevel(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty, request.Comment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
"@
