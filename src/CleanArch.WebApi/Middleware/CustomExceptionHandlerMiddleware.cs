using System.Text.Json;
using CleanArch.Application.Common.Exceptions;
using CleanArch.Domain.Exceptions;

namespace CleanArch.WebApi.Middleware;

public class CustomExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CustomExceptionHandlerMiddleware> _logger;

    public CustomExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<CustomExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        int statusCode = StatusCodes.Status500InternalServerError;
        object response = new
        {
            title = "Internal Server Error",
            status = StatusCodes.Status500InternalServerError,
            detail = "An unexpected error occurred."
        };

        if (exception is ValidationException validationException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            response = new
            {
                title = "Validation Failed",
                status = StatusCodes.Status400BadRequest,
                errors = validationException.Errors
            };
        }
        else if (exception is DomainException domainException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            response = new
            {
                title = "Business Rule Violation",
                status = StatusCodes.Status400BadRequest,
                detail = domainException.Message
            };
        }

        _logger.LogError(exception, "Unhandled Exception: {Message}", exception.Message);

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
