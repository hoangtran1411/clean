using Serilog.Context;

namespace CleanArch.WebApi.Middleware;

/// <summary>
/// Middleware that extracts or generates a unique Correlation ID for distributed tracing.
/// Pushes the Correlation ID into Serilog LogContext so all log statements in the request include it.
/// </summary>
public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-ID";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // 1. Extract existing correlation ID or generate a new one
        var correlationId = context.Request.Headers.TryGetValue(CorrelationIdHeader, out var headerValue) &&
                            !string.IsNullOrWhiteSpace(headerValue.ToString())
            ? headerValue.ToString()
            : Guid.NewGuid().ToString();

        // 2. Set response header so client can trace the request
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        // 3. Push CorrelationId into Serilog LogContext for the scope of this request
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
