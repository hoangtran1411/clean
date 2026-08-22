using System.ComponentModel.DataAnnotations;

namespace IdentityJwtDemo.DTOs;

public class CreatePaymentDto
{
    [Required]
    [Range(0.01, 1000000.00, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter ISO code (e.g. USD, EUR, VND)")]
    public string Currency { get; set; } = "USD";

    [Required]
    public string OrderReference { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}

public class PaymentReceiptDto
{
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public string OrderReference { get; set; } = string.Empty;
    public string Status { get; set; } = "SUCCESS";
    public DateTime ProcessedAtUtc { get; set; }
    public string ProcessedBy { get; set; } = string.Empty;
}
