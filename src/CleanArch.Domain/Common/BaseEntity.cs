namespace CleanArch.Domain.Common;

/// <summary>
/// Base entity containing common identifier and audit timestamps.
/// Domain Layer has ZERO external dependencies.
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastModifiedAtUtc { get; set; }
}
