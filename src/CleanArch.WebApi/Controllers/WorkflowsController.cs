using CleanArch.Application.Features.Workflows.Commands.ApproveWorkflowLevel;
using CleanArch.Application.Features.Workflows.Commands.CompleteWorkflow;
using CleanArch.Application.Features.Workflows.Commands.CreateWorkflowRequest;
using CleanArch.Application.Features.Workflows.Commands.RejectWorkflow;
using CleanArch.Application.Features.Workflows.Commands.SubmitWorkflowRequest;
using CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequestById;
using CleanArch.Application.Features.Workflows.Queries.GetWorkflowRequests;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Enums;
using CleanArch.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

[Authorize]
public class WorkflowsController : ApiControllerBase
{
    [HttpGet]
    [HasPermission(AppPermissions.WorkflowsView)]
    public async Task<IActionResult> GetWorkflows([FromQuery] WorkflowStatus? status)
    {
        var result = await Mediator.Send(new GetWorkflowRequestsQuery(status));
        return Ok(result);
    }

    [HttpGet("{id}")]
    [HasPermission(AppPermissions.WorkflowsView)]
    public async Task<IActionResult> GetWorkflow(int id)
    {
        var result = await Mediator.Send(new GetWorkflowRequestByIdQuery(id));
        return Ok(result);
    }

    [HttpPost]
    [HasPermission(AppPermissions.WorkflowsCreate)]
    public async Task<IActionResult> CreateWorkflow([FromBody] CreateWorkflowRequestCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/submit")]
    [HasPermission(AppPermissions.WorkflowsSubmit)]
    public async Task<IActionResult> SubmitWorkflow(int id)
    {
        var result = await Mediator.Send(new SubmitWorkflowRequestCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/approve")]
    // Permission is checked dynamically in handler
    public async Task<IActionResult> Approve(int id, [FromBody] ApproveRequest request)
    {
        var result = await Mediator.Send(new ApproveWorkflowLevelCommand(id, request.Comment));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/reject")]
    [HasPermission(AppPermissions.WorkflowsReject)]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectRequest request)
    {
        var result = await Mediator.Send(new RejectWorkflowCommand(id, request.RejectionReason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/complete")]
    [HasPermission(AppPermissions.WorkflowsComplete)]
    public async Task<IActionResult> Complete(int id)
    {
        var result = await Mediator.Send(new CompleteWorkflowCommand(id));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/obsolete")]
    [HasPermission(AppPermissions.WorkflowsObsolete)]
    public async Task<IActionResult> Obsolete(int id, [FromBody] ObsoleteRequest request)
    {
        var result = await Mediator.Send(new CleanArch.Application.Features.Workflows.Commands.ObsoleteWorkflow.ObsoleteWorkflowCommand(id, request.ObsolescenceReason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    [HttpPost("{id}/reset-to-draft")]
    [HasPermission(AppPermissions.WorkflowsResetToDraft)]
    public async Task<IActionResult> ResetToDraft(int id, [FromBody] ResetToDraftRequest request)
    {
        var result = await Mediator.Send(new CleanArch.Application.Features.Workflows.Commands.ResetWorkflowToDraft.ResetWorkflowToDraftCommand(id, request.Reason));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}

public record ApproveRequest(string? Comment);
public record RejectRequest(string RejectionReason);
public record ObsoleteRequest(string ObsolescenceReason);
public record ResetToDraftRequest(string Reason);
