using CleanArch.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErrorsTestController : ApiControllerBase
{
    /// <summary>
    /// Test 404 Not Found Exception.
    /// </summary>
    [HttpGet("not-found")]
    public IActionResult TestNotFound()
    {
        throw new NotFoundException("CustomerOrder", 9999);
    }

    /// <summary>
    /// Test 409 Conflict Exception.
    /// </summary>
    [HttpGet("conflict")]
    public IActionResult TestConflict()
    {
        throw new ConflictException("Order #ORD-9876 has already been refunded and cannot be modified.");
    }

    /// <summary>
    /// Test 400 Domain / Business Rule Violation Exception.
    /// </summary>
    [HttpGet("domain-error")]
    public IActionResult TestDomainError()
    {
        throw new DomainException("Credit balance limit of $5,000 exceeded for this account.");
    }

    /// <summary>
    /// Test 403 Forbidden Exception.
    /// </summary>
    [HttpGet("forbidden")]
    public IActionResult TestForbidden()
    {
        throw new ForbiddenException("You do not have the required administrative clearance to access this audit vault.");
    }

    /// <summary>
    /// Test 500 Unhandled Internal Server Error (Masked for security).
    /// </summary>
    [HttpGet("server-error")]
    public IActionResult TestServerError()
    {
        int a = 10;
        int b = 0;
        int result = a / b; // Throws DivideByZeroException
        return Ok(result);
    }
}
