using CleanArch.Application.Features.Products.DTOs;
using CleanArch.Domain.Entities;

namespace CleanArch.Application.Common.Interfaces;

public interface IExcelService
{
    /// <summary>
    /// Exports product list to styled Excel bytes (LoadFromCollection, formulas, conditional formatting).
    /// </summary>
    byte[] ExportProductsToExcel(IEnumerable<ProductDto> products);

    /// <summary>
    /// Generates a validated template with category dropdown validation and sample row.
    /// </summary>
    byte[] GenerateProductTemplateExcel();

    /// <summary>
    /// Parses an uploaded Excel stream, validates row by row, and returns valid entities along with any row errors.
    /// </summary>
    Task<(List<ProductItem> ValidProducts, List<string> Errors)> ImportProductsFromExcelAsync(
        Stream fileStream,
        CancellationToken cancellationToken = default);
}
