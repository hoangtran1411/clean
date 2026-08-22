using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class PaymentRecord : BaseEntity
{
    public Guid TransactionId { get; set; } = Guid.NewGuid();
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string OrderReference { get; set; } = string.Empty;
    public string Status { get; set; } = "COMPLETED";
    public string ProcessedBy { get; set; } = string.Empty;
    public DateTime ProcessedAtUtc { get; set; } = DateTime.UtcNow;
}
