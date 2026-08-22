using IdentityJwtDemo.DTOs;
using IdentityJwtDemo.Idempotency;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityJwtDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires authenticated user
public class PaymentsController : ControllerBase
{
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(ILogger<PaymentsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Process a payment charge with guaranteed Idempotency.
    /// Requires HTTP header: 'Idempotency-Key: <UUID>'
    /// </summary>
    [HttpPost("charge")]
    [Idempotent(ExpiresInHours = 24)]
    [ProducesResponseType(typeof(PaymentReceiptDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> ChargePayment([FromBody] CreatePaymentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var currentUser = User.Identity?.Name ?? "Anonymous";

        // Simulate financial charge delay (e.g. calling bank / Stripe gateway)
        _logger.LogInformation(
            "⚡ [TRANSACTION EXECUTED] Processing charge of {Amount} {Currency} for Order: {Order} by User: {User}",
            dto.Amount, dto.Currency, dto.OrderReference, currentUser);

        await Task.Delay(200); // Simulate network latency

        var receipt = new PaymentReceiptDto
        {
            TransactionId = Guid.NewGuid(),
            Amount = dto.Amount,
            Currency = dto.Currency.ToUpperInvariant(),
            OrderReference = dto.OrderReference,
            Status = "COMPLETED",
            ProcessedAtUtc = DateTime.UtcNow,
            ProcessedBy = currentUser
        };

        return Ok(receipt);
    }
}
