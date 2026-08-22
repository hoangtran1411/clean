using CleanArch.Application.Common.Models;

namespace CleanArch.Application.Common.Interfaces;

public interface IIdempotencyService
{
    Task<IdempotencyCheckResult> CheckAsync(string key, string? userId, string requestPath, string requestHash);

    Task SaveResponseAsync(
        string key,
        string? userId,
        string requestPath,
        string requestHash,
        int statusCode,
        string responseBody,
        string? contentType,
        TimeSpan ttl);
}
