using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CleanArch.WebApi.Idempotency;

public class IdempotentActionFilter : IAsyncActionFilter
{
    private readonly IIdempotencyService _idempotencyService;
    private readonly int _expiresInHours;
    private readonly string _headerName;

    public IdempotentActionFilter(
        IIdempotencyService idempotencyService,
        int expiresInHours,
        string headerName)
    {
        _idempotencyService = idempotencyService;
        _expiresInHours = expiresInHours;
        _headerName = headerName;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var httpContext = context.HttpContext;

        if (!httpContext.Request.Headers.TryGetValue(_headerName, out var headerValues) ||
            string.IsNullOrWhiteSpace(headerValues.ToString()))
        {
            context.Result = new BadRequestObjectResult(new
            {
                error = "MissingIdempotencyKey",
                message = $"The '{_headerName}' header is required for this operation."
            });
            return;
        }

        var idempotencyKey = headerValues.ToString();
        var requestPath = httpContext.Request.Path.ToString();
        var userId = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        httpContext.Request.EnableBuffering();
        using (var reader = new StreamReader(httpContext.Request.Body, Encoding.UTF8, leaveOpen: true))
        {
            var rawBody = await reader.ReadToEndAsync();
            httpContext.Request.Body.Position = 0;

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawBody));
            var requestHash = Convert.ToHexString(hashBytes);

            var checkResult = await _idempotencyService.CheckAsync(
                idempotencyKey,
                userId,
                requestPath,
                requestHash);

            if (checkResult.Status == IdempotencyStatus.CachedHit)
            {
                httpContext.Response.Headers["X-Cache"] = "IDEMPOTENT-HIT";
                httpContext.Response.Headers[_headerName] = idempotencyKey;

                context.Result = new ContentResult
                {
                    StatusCode = checkResult.CachedStatusCode,
                    Content = checkResult.CachedResponseBody,
                    ContentType = checkResult.CachedContentType ?? "application/json"
                };
                return;
            }

            if (checkResult.Status == IdempotencyStatus.PayloadMismatch)
            {
                context.Result = new ObjectResult(new
                {
                    error = "IdempotencyKeyConflict",
                    message = $"The '{_headerName}' was previously used with a different request payload."
                })
                {
                    StatusCode = StatusCodes.Status422UnprocessableEntity
                };
                return;
            }

            var executedContext = await next();

            if (executedContext.Result is ObjectResult objectResult &&
                (objectResult.StatusCode == null || objectResult.StatusCode < 400))
            {
                var statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
                var responseJson = JsonSerializer.Serialize(objectResult.Value);

                await _idempotencyService.SaveResponseAsync(
                    idempotencyKey,
                    userId,
                    requestPath,
                    requestHash,
                    statusCode,
                    responseJson,
                    "application/json",
                    TimeSpan.FromHours(_expiresInHours));

                httpContext.Response.Headers["X-Cache"] = "IDEMPOTENT-MISS";
                httpContext.Response.Headers[_headerName] = idempotencyKey;
            }
        }
    }
}
