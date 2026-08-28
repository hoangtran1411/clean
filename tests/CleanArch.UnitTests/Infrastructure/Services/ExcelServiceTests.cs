using CleanArch.Application.Features.Products.DTOs;
using CleanArch.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using OfficeOpenXml;
using Xunit;

namespace CleanArch.UnitTests.Infrastructure.Services;

public class ExcelServiceTests
{
    private readonly ExcelService _service = new(NullLogger<ExcelService>.Instance);

    [Fact]
    public void ExportProductsToExcel_Should_Generate_Valid_Spreadsheet_With_Styles_And_Data()
    {
        // Arrange
        var products = new List<ProductDto>
        {
            new() { Id = 1, Name = "MacBook Pro M4", Category = "Laptops", Price = 3499.99m, StockQuantity = 15, CreatedAtUtc = DateTime.UtcNow },
            new() { Id = 2, Name = "Mouse Pad", Category = "Accessories", Price = 19.99m, StockQuantity = 5, CreatedAtUtc = DateTime.UtcNow }
        };

        // Act
        var bytes = _service.ExportProductsToExcel(products);

        // Assert
        bytes.Should().NotBeNullOrEmpty();

        using var stream = new MemoryStream(bytes);
        using var package = new ExcelPackage(stream);
        var ws = package.Workbook.Worksheets["Product Catalog"];
        ws.Should().NotBeNull();

        // Check Header
        ws.Cells[1, 1].Text.Should().Be("Product ID");
        ws.Cells[1, 2].Text.Should().Be("Product Name");
        ws.Cells[1, 3].Text.Should().Be("Category");
        ws.Cells[1, 4].Text.Should().Be("Unit Price");
        ws.Cells[1, 5].Text.Should().Be("Stock Qty");

        // Check Row 2
        ws.Cells[2, 1].Value.Should().Be(1);
        ws.Cells[2, 2].Text.Should().Be("MacBook Pro M4");
        ws.Cells[2, 3].Text.Should().Be("Laptops");

        // Check Row 3
        ws.Cells[3, 1].Value.Should().Be(2);
        ws.Cells[3, 2].Text.Should().Be("Mouse Pad");
        ws.Cells[3, 3].Text.Should().Be("Accessories");
    }

    [Fact]
    public void GenerateProductTemplateExcel_Should_Include_Category_DataValidation()
    {
        // Act
        var bytes = _service.GenerateProductTemplateExcel();

        // Assert
        bytes.Should().NotBeNullOrEmpty();

        using var stream = new MemoryStream(bytes);
        using var package = new ExcelPackage(stream);
        var ws = package.Workbook.Worksheets["Import Template"];
        ws.Should().NotBeNull();

        // Check Header Row
        ws.Cells["A1"].Text.Should().Contain("Product Name");
        ws.Cells["B1"].Text.Should().Contain("Category");
        ws.Cells["C1"].Text.Should().Contain("Price");
        ws.Cells["D1"].Text.Should().Contain("Stock Quantity");

        // Check Data Validation
        ws.DataValidations.Should().NotBeEmpty();
    }

    [Fact]
    public async Task ImportProductsFromExcelAsync_Should_Return_Errors_When_Headers_Are_Invalid()
    {
        // Arrange
        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("Invalid");
        ws.Cells[1, 1].Value = "WrongCol1";
        ws.Cells[1, 2].Value = "WrongCol2";
        ws.Cells[2, 1].Value = "Sample Product";
        ws.Cells[2, 2].Value = "Laptops";

        var bytes = package.GetAsByteArray();
        using var stream = new MemoryStream(bytes);

        // Act
        var (validProducts, errors) = await _service.ImportProductsFromExcelAsync(stream);

        // Assert
        validProducts.Should().BeEmpty();
        errors.Should().ContainSingle(e => e.Contains("Invalid template structure"));
    }

    [Fact]
    public async Task ImportProductsFromExcelAsync_Should_Return_Errors_When_No_Data_Rows()
    {
        // Arrange
        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("EmptyData");
        ws.Cells[1, 1].Value = "Product Name";
        ws.Cells[1, 2].Value = "Category";

        var bytes = package.GetAsByteArray();
        using var stream = new MemoryStream(bytes);

        // Act
        var (validProducts, errors) = await _service.ImportProductsFromExcelAsync(stream);

        // Assert
        validProducts.Should().BeEmpty();
        errors.Should().ContainSingle(e => e.Contains("contains no data rows"));
    }
}
