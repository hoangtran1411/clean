namespace CleanArch.Application.Features.Payments.DTOs;

public class PaymentReceiptDto
{
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string OrderReference { get; set; } = string.Empty;
    public string Status { get; set; } = "COMPLETED";
    public DateTime ProcessedAtUtc { get; set; }
    public string ProcessedBy { get; set; } = string.Empty;
}
