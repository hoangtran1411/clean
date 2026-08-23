using CleanArch.Domain.Common;

namespace CleanArch.Domain.Entities;

public class ProductItem : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
}
