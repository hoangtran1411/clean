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
            
        if (wfRequest == null) throw new NotFoundException("WorkflowRequest", request.Id);

        wfRequest.Submit(_currentUserService.UserId ?? string.Empty, _currentUserService.UserName ?? string.Empty);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<WorkflowRequestDto>.Success(new WorkflowRequestDto { Id = wfRequest.Id });
    }
}
