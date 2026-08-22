namespace CleanArch.Application.Common.Models;

public enum IdempotencyStatus
{
    New,
    CachedHit,
    PayloadMismatch
}

public class IdempotencyCheckResult
{
    public IdempotencyStatus Status { get; set; }
    public int? CachedStatusCode { get; set; }
    public string? CachedResponseBody { get; set; }
    public string? CachedContentType { get; set; }
}
