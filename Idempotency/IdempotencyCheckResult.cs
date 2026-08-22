namespace IdentityJwtDemo.Idempotency;

public enum IdempotencyStatus
{
    /// <summary>
    /// Key has not been seen before (or has expired). Proceed with execution.
    /// </summary>
    New,

    /// <summary>
    /// Key has been processed already with the exact same request payload. Return cached response.
    /// </summary>
    CachedHit,

    /// <summary>
    /// Key exists but was used with a DIFFERENT request payload. Reject request.
    /// </summary>
    PayloadMismatch
}

public class IdempotencyCheckResult
{
    public IdempotencyStatus Status { get; set; }
    public int? CachedStatusCode { get; set; }
    public string? CachedResponseBody { get; set; }
    public string? CachedContentType { get; set; }
}
