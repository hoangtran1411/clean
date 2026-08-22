using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class IdempotentRecord : BaseEntity
{
    public string IdempotencyKey { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string RequestPath { get; set; } = string.Empty;
    public string RequestHash { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string ResponseBody { get; set; } = string.Empty;
    public string? ContentType { get; set; } = "application/json";
    public DateTime ExpiresAtUtc { get; set; }
}
