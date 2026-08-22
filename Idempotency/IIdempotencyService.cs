namespace IdentityJwtDemo.Idempotency;

public interface IIdempotencyService
{
    /// <summary>
    /// Checks if a request with the given Idempotency-Key and payload hash has already been processed.
    /// </summary>
    Task<IdempotencyCheckResult> CheckAsync(string key, string? userId, string requestPath, string requestHash);

    /// <summary>
    /// Stores the completed HTTP response for an Idempotency-Key.
    /// </summary>
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
