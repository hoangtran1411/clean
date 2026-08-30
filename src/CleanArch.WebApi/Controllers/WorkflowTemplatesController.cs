using CleanArch.Application.Features.Workflows.Commands.CreateWorkflowTemplate;
using CleanArch.Application.Features.Workflows.Queries.GetWorkflowTemplates;
using CleanArch.Domain.Constants;
using CleanArch.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

[Authorize]
[Route("api/workflow-templates")]
[Route("api/[controller]")]
public class WorkflowTemplatesController : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var result = await Mediator.Send(new GetWorkflowTemplatesQuery());
        return Ok(result);
    }

    [HttpPost]
    [HasPermission(AppPermissions.WorkflowsManageTemplates)]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateWorkflowTemplateCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
