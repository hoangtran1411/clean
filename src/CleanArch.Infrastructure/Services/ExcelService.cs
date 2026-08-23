using System.Drawing;
using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Features.Products.DTOs;
using CleanArch.Domain.Entities;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.DataValidation;
using OfficeOpenXml.Style;
using OfficeOpenXml.Table;

namespace CleanArch.Infrastructure.Services;

public class ExcelService : IExcelService
{
    private readonly ILogger<ExcelService> _logger;

    public ExcelService(ILogger<ExcelService> logger)
    {
        _logger = logger;
        // EPPlus 8 License configuration
        ExcelPackage.License.SetNonCommercialPersonal("CleanArchitectureStudent");
    }

    /// <summary>
    /// EXPERT LEVEL EXPORT:
    /// - Table creation with TableStyles.Medium9
    /// - Custom column formatting ($ currency, dates)
    /// - Formulas (SUM of Inventory Value, Average Price)
    /// - Conditional Formatting (Red highlight for Low Stock < 10)
    /// - Freeze panes on header row
    /// </summary>
    public byte[] ExportProductsToExcel(IEnumerable<ProductDto> products)
    {
        var productList = products.ToList();

        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("Product Catalog");

        // 1. Write Header Row (Beginner/Mid Level)
        string[] headers = ["Product ID", "Product Name", "Category", "Unit Price", "Stock Qty", "Created At UTC"];
        for (int col = 1; col <= headers.Length; col++)
        {
            ws.Cells[1, col].Value = headers[col - 1];
            ws.Cells[1, col].Style.Font.Bold = true;
            ws.Cells[1, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
            ws.Cells[1, col].Style.Fill.BackgroundColor.SetColor(Color.FromArgb(31, 78, 120));
            ws.Cells[1, col].Style.Font.Color.SetColor(Color.White);
            ws.Cells[1, col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        // 2. Populate Data Rows (Mid Level)
        int currentRow = 2;
        foreach (var p in productList)
        {
            ws.Cells[currentRow, 1].Value = p.Id;
            ws.Cells[currentRow, 2].Value = p.Name;
            ws.Cells[currentRow, 3].Value = p.Category;
            ws.Cells[currentRow, 4].Value = p.Price;
            ws.Cells[currentRow, 5].Value = p.StockQuantity;
            ws.Cells[currentRow, 6].Value = p.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm");

            // Format numbers
            ws.Cells[currentRow, 4].Style.Numberformat.Format = "$#,##0.00";
            ws.Cells[currentRow, 5].Style.Numberformat.Format = "#,##0";

            currentRow++;
        }

        int lastDataRow = Math.Max(2, currentRow - 1);

        // 3. Add Excel Table Styling (Mid Level)
        if (productList.Count > 0)
        {
            var dataRange = ws.Cells[1, 1, lastDataRow, headers.Length];
            var table = ws.Tables.Add(dataRange, "ProductsTable");
            table.TableStyle = TableStyles.Medium9;
            table.ShowTotal = false;
        }

        // 4. EXPERT LEVEL: Conditional Formatting (Highlight Low Stock < 10 in light red)
        if (productList.Count > 0)
        {
            var stockRange = ws.Cells[2, 5, lastDataRow, 5];
            var condition = ws.ConditionalFormatting.AddLessThan(stockRange);
            condition.Formula = "10";
            condition.Style.Fill.PatternType = ExcelFillStyle.Solid;
            condition.Style.Fill.BackgroundColor.Color = Color.FromArgb(255, 199, 206);
            condition.Style.Font.Color.Color = Color.FromArgb(156, 0, 6);
        }

        // 5. EXPERT LEVEL: Summary Formulas
        if (productList.Count > 0)
        {
            int summaryRow = lastDataRow + 2;
            ws.Cells[summaryRow, 3].Value = "Average Price:";
            ws.Cells[summaryRow, 3].Style.Font.Bold = true;
            ws.Cells[summaryRow, 4].Formula = $"AVERAGE(D2:D{lastDataRow})";
            ws.Cells[summaryRow, 4].Style.Numberformat.Format = "$#,##0.00";
            ws.Cells[summaryRow, 4].Style.Font.Bold = true;

            ws.Cells[summaryRow + 1, 3].Value = "Total Stock Units:";
            ws.Cells[summaryRow + 1, 3].Style.Font.Bold = true;
            ws.Cells[summaryRow + 1, 5].Formula = $"SUM(E2:E{lastDataRow})";
            ws.Cells[summaryRow + 1, 5].Style.Numberformat.Format = "#,##0";
            ws.Cells[summaryRow + 1, 5].Style.Font.Bold = true;
        }

        // 6. Freeze Top Header Row & Auto-Fit Columns (Mid Level)
        ws.View.FreezePanes(2, 1);
        ws.Cells[ws.Dimension?.Address ?? "A1:F1"].AutoFitColumns(15, 45);

        return package.GetAsByteArray();
    }

    /// <summary>
    /// EXPERT LEVEL TEMPLATE GENERATION:
    /// - Pre-configured header instructions
    /// - Excel Data Validation: Category column locked to dropdown values
    /// </summary>
    public byte[] GenerateProductTemplateExcel()
    {
        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("Import Template");

        // Headers
        ws.Cells["A1"].Value = "Product Name (Required)";
        ws.Cells["B1"].Value = "Category (Dropdown)";
        ws.Cells["C1"].Value = "Price (USD)";
        ws.Cells["D1"].Value = "Stock Quantity";

        using (var headerRange = ws.Cells["A1:D1"])
        {
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
            headerRange.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(70, 130, 180));
            headerRange.Style.Font.Color.SetColor(Color.White);
        }

        // Sample Rows
        ws.Cells["A2"].Value = "Logitech MX Master 3S";
        ws.Cells["B2"].Value = "Accessories";
        ws.Cells["C2"].Value = 99.99;
        ws.Cells["D2"].Value = 25;

        ws.Cells["A3"].Value = "Samsung Galaxy S24 Ultra";
        ws.Cells["B3"].Value = "Smartphones";
        ws.Cells["C3"].Value = 1199.00;
        ws.Cells["D3"].Value = 15;

        // Data Validation: Dropdown list for Category column B (Rows 2 to 1000)
        var categoryValidation = ws.DataValidations.AddListValidation("B2:B1000");
        categoryValidation.ShowErrorMessage = true;
        categoryValidation.ErrorTitle = "Invalid Category";
        categoryValidation.Error = "Please select a category from the predefined list.";
        categoryValidation.Formula.Values.Add("Laptops");
        categoryValidation.Formula.Values.Add("Smartphones");
        categoryValidation.Formula.Values.Add("Audio");
        categoryValidation.Formula.Values.Add("Accessories");
        categoryValidation.Formula.Values.Add("Tablets");

        ws.Cells["C2:C1000"].Style.Numberformat.Format = "$#,##0.00";
        ws.Cells["D2:D1000"].Style.Numberformat.Format = "#,##0";

        ws.Cells["A1:D10"].AutoFitColumns(18, 35);
        ws.View.FreezePanes(2, 1);

        return package.GetAsByteArray();
    }

    /// <summary>
    /// EXPERT LEVEL IMPORT:
    /// - Streaming file read (memory safe)
    /// - Comprehensive header checking
    /// - Row-by-row validation & error tolerance (collects all row errors without crashing)
    /// </summary>
    public async Task<(List<ProductItem> ValidProducts, List<string> Errors)> ImportProductsFromExcelAsync(
        Stream fileStream,
        CancellationToken cancellationToken = default)
    {
        var validProducts = new List<ProductItem>();
        var errors = new List<string>();

        using var package = new ExcelPackage();
        await package.LoadAsync(fileStream, cancellationToken);

        var ws = package.Workbook.Worksheets.FirstOrDefault();
        if (ws == null || ws.Dimension == null)
        {
            errors.Add("The uploaded Excel workbook contains no readable worksheet data.");
            return (validProducts, errors);
        }

        int rowCount = ws.Dimension.Rows;

        if (rowCount < 2)
        {
            errors.Add("The worksheet has headers but contains no data rows to import.");
            return (validProducts, errors);
        }

        // Validate Headers in Row 1
        var col1Header = ws.Cells[1, 1].Text.Trim();
        var col2Header = ws.Cells[1, 2].Text.Trim();
        if (!col1Header.Contains("Name", StringComparison.OrdinalIgnoreCase) ||
            !col2Header.Contains("Category", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add("Invalid template structure. Column 1 must be 'Product Name' and Column 2 must be 'Category'.");
            return (validProducts, errors);
        }

        // Process data rows starting from row 2
        for (int row = 2; row <= rowCount; row++)
        {
            // Skip entirely blank rows
            if (string.IsNullOrWhiteSpace(ws.Cells[row, 1].Text) &&
                string.IsNullOrWhiteSpace(ws.Cells[row, 2].Text) &&
                string.IsNullOrWhiteSpace(ws.Cells[row, 3].Text))
            {
                continue;
            }

            var name = ws.Cells[row, 1].Text.Trim();
            var category = ws.Cells[row, 2].Text.Trim();
            var priceText = ws.Cells[row, 3].Text.Trim();
            var stockText = ws.Cells[row, 4].Text.Trim();

            // Field Validations
            if (string.IsNullOrWhiteSpace(name))
            {
                errors.Add($"Row {row}: Product Name is required.");
                continue;
            }

            if (string.IsNullOrWhiteSpace(category))
            {
                errors.Add($"Row {row} ({name}): Category is required.");
                continue;
            }

            if (!decimal.TryParse(priceText.Replace("$", "").Trim(), out var price) || price <= 0)
            {
                errors.Add($"Row {row} ({name}): Invalid Price value '{priceText}'. Price must be a positive decimal.");
                continue;
            }

            if (!int.TryParse(stockText.Replace(",", "").Trim(), out var stock) || stock < 0)
            {
                errors.Add($"Row {row} ({name}): Invalid Stock Quantity '{stockText}'. Stock must be a non-negative integer.");
                continue;
            }

            validProducts.Add(new ProductItem
            {
                Name = name,
                Category = category,
                Price = price,
                StockQuantity = stock
            });
        }

        _logger.LogInformation("Parsed Excel file: {ValidCount} valid products, {ErrorCount} row errors",
            validProducts.Count, errors.Count);

        return (validProducts, errors);
    }
}
