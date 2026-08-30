using CleanArch.Application.Features.Dashboard.Queries.GetDashboardMetrics;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

public class DashboardController : ApiControllerBase
{
    /// <summary>
    /// Retrieves executive ERP metrics, live database aggregations, and runtime system telemetry.
    /// </summary>
    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics([FromQuery] string period = "month")
    {
        var result = await Mediator.Send(new GetDashboardMetricsQuery(period));
        return Ok(result);
    }
}
