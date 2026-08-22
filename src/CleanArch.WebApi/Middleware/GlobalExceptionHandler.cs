using System.Diagnostics;
using CleanArch.Application.Common.Exceptions;
using CleanArch.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Middleware;

/// <summary>
/// Modern .NET 10 Global Exception Handler implementing IExceptionHandler.
/// Intercepts all unhandled exceptions and outputs standardized RFC 7807 / RFC 9457 ProblemDetails JSON.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IProblemDetailsService _problemDetailsService;

    public GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IProblemDetailsService problemDetailsService)
    {
        _logger = logger;
        _problemDetailsService = problemDetailsService;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled Exception: {Message}", exception.Message);

        var (statusCode, title, detail) = exception switch
        {
            ValidationException => (
                StatusCodes.Status400BadRequest,
                "Validation Error",
                "One or more validation errors occurred."),

            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Resource Not Found",
                exception.Message),

            ConflictException => (
                StatusCodes.Status409Conflict,
                "Conflict Error",
                exception.Message),

            ForbiddenException => (
                StatusCodes.Status403Forbidden,
                "Access Forbidden",
                exception.Message),

            DomainException => (
                StatusCodes.Status400BadRequest,
                "Domain Rule Violation",
                exception.Message),

            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "You are not authorized to perform this operation."),

            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "An unexpected server error occurred. Please contact support if the issue persists.")
        };

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path
        };

        // Attach validation errors if applicable
        if (exception is ValidationException validationException)
        {
            problemDetails.Extensions["errors"] = validationException.Errors;
        }

        // Attach standard trace identifier for observability
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        problemDetails.Extensions["traceId"] = traceId;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }
}
