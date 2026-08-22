using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Payments.Commands.ChargePayment;
using CleanArch.Application.Features.Payments.DTOs;
using CleanArch.WebApi.Idempotency;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

[Authorize]
public class PaymentsController : ApiControllerBase
{
    /// <summary>
    /// Process a financial charge with guaranteed API Idempotency.
    /// Requires 'Idempotency-Key' HTTP header.
    /// </summary>
    [HttpPost("charge")]
    [Idempotent(ExpiresInHours = 24)]
    [ProducesResponseType(typeof(Result<PaymentReceiptDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> ChargePayment([FromBody] ChargePaymentCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
