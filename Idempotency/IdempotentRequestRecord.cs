namespace IdentityJwtDemo.Idempotency;

/// <summary>
/// Entity representing a cached idempotent request and its response.
/// </summary>
public class IdempotentRequestRecord
{
    public int Id { get; set; }

    /// <summary>
    /// Unique key provided by the client in the 'Idempotency-Key' HTTP header.
    /// </summary>
    public string IdempotencyKey { get; set; } = string.Empty;

    /// <summary>
    /// The user who initiated the request, ensuring keys are isolated per user.
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>
    /// The target HTTP route (e.g. /api/payments/charge).
    /// </summary>
    public string RequestPath { get; set; } = string.Empty;

    /// <summary>
    /// SHA256 hash of the request payload to ensure the payload hasn't changed.
    /// </summary>
    public string RequestHash { get; set; } = string.Empty;

    /// <summary>
    /// Cached HTTP response status code (e.g. 200, 201).
    /// </summary>
    public int StatusCode { get; set; }

    /// <summary>
    /// Cached JSON response body.
    /// </summary>
    public string ResponseBody { get; set; } = string.Empty;

    /// <summary>
    /// Response Content-Type (usually application/json).
    /// </summary>
    public string? ContentType { get; set; } = "application/json";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }
}
