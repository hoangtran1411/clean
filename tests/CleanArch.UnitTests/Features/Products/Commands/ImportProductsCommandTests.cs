using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Features.Products.Commands.ImportProducts;
using CleanArch.Domain.Entities;
using CleanArch.Infrastructure.Services;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OfficeOpenXml;
using Xunit;

namespace CleanArch.UnitTests.Features.Products.Commands;

public class ImportProductsCommandHandlerTests
{
    [Fact]
    public async Task Should_Successfully_Persist_Valid_Products_And_Return_Correct_Counts()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();
        var mockCache = new Mock<IMemoryCache>();

        var validProducts = new List<ProductItem>
        {
            new() { Name = "MacBook Air M3", Category = "Laptops", Price = 1099.00m, StockQuantity = 20 },
            new() { Name = "Sony WH-1000XM5", Category = "Audio", Price = 399.99m, StockQuantity = 50 },
            new() { Name = "iPad Pro 11", Category = "Tablets", Price = 999.00m, StockQuantity = 15 }
        };

        mockExcelService
            .Setup(x => x.ImportProductsFromExcelAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((validProducts, new List<string>()));

        var handler = new ImportProductsCommandHandler(context, mockExcelService.Object, mockCache.Object);
        using var dummyStream = new MemoryStream();
        var command = new ImportProductsCommand(dummyStream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Be("Successfully imported 3 products. 0 errors encountered.");
        result.Data.Should().NotBeNull();
        result.Data!.ImportedCount.Should().Be(3);
        result.Data.ErrorCount.Should().Be(0);
        result.Data.Errors.Should().BeEmpty();

        // Verify entities persisted in DbContext
        var dbProducts = await context.Products.ToListAsync();
        dbProducts.Should().HaveCount(3);
        dbProducts.Should().Contain(p => p.Name == "MacBook Air M3" && p.Category == "Laptops");
        dbProducts.Should().Contain(p => p.Name == "Sony WH-1000XM5" && p.Category == "Audio");
        dbProducts.Should().Contain(p => p.Name == "iPad Pro 11" && p.Category == "Tablets");
    }

    [Fact]
    public async Task Should_Invalidate_Cache_For_All_And_Each_Distinct_Category_In_Lower_Case()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();
        var mockCache = new Mock<IMemoryCache>();

        var validProducts = new List<ProductItem>
        {
            new() { Name = "Laptop A", Category = "Laptops", Price = 999m, StockQuantity = 10 },
            new() { Name = "Laptop B", Category = "LAPTOPS", Price = 1299m, StockQuantity = 5 }, // duplicate category with different casing
            new() { Name = "Earbuds", Category = "Audio", Price = 149m, StockQuantity = 30 },
            new() { Name = "Headphones", Category = "Audio", Price = 299m, StockQuantity = 15 },
            new() { Name = "Mouse", Category = "Accessories", Price = 49m, StockQuantity = 50 }
        };

        mockExcelService
            .Setup(x => x.ImportProductsFromExcelAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((validProducts, new List<string>()));

        var handler = new ImportProductsCommandHandler(context, mockExcelService.Object, mockCache.Object);
        using var stream = new MemoryStream();
        var command = new ImportProductsCommand(stream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        // Verify "products_list_all" is removed once
        mockCache.Verify(m => m.Remove("products_list_all"), Times.Once);

        // Verify distinct categories are removed once each
        mockCache.Verify(m => m.Remove("products_list_laptops"), Times.Once);
        mockCache.Verify(m => m.Remove("products_list_audio"), Times.Once);
        mockCache.Verify(m => m.Remove("products_list_accessories"), Times.Once);

        // Verify total calls to Remove equals 4 (all + 3 distinct categories)
        mockCache.Verify(m => m.Remove(It.IsAny<object>()), Times.Exactly(4));
    }

    [Fact]
    public async Task Should_Handle_Partial_Excel_Validation_Errors_Correctly()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();
        var mockCache = new Mock<IMemoryCache>();

        var validProducts = new List<ProductItem>
        {
            new() { Name = "Valid Laptop", Category = "Laptops", Price = 1500m, StockQuantity = 10 },
            new() { Name = "Valid Mouse", Category = "Accessories", Price = 30m, StockQuantity = 50 }
        };

        var rowErrors = new List<string>
        {
            "Row 3 (Corrupt Item): Invalid Price value 'INVALID_PRICE'. Price must be a positive decimal.",
            "Row 4: Product Name is required.",
            "Row 5 (Unknown Item): Invalid Stock Quantity '-5'. Stock must be a non-negative integer."
        };

        mockExcelService
            .Setup(x => x.ImportProductsFromExcelAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((validProducts, rowErrors));

        var handler = new ImportProductsCommandHandler(context, mockExcelService.Object, mockCache.Object);
        using var stream = new MemoryStream();
        var command = new ImportProductsCommand(stream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Be("Successfully imported 2 products. 3 errors encountered.");
        result.Data.Should().NotBeNull();
        result.Data!.ImportedCount.Should().Be(2);
        result.Data.ErrorCount.Should().Be(3);
        result.Data.Errors.Should().HaveCount(3);
        result.Data.Errors.Should().Contain(rowErrors);

        // Verify ONLY valid products were persisted
        var dbProducts = await context.Products.ToListAsync();
        dbProducts.Should().HaveCount(2);
        dbProducts.Select(p => p.Name).Should().BeEquivalentTo(new[] { "Valid Laptop", "Valid Mouse" });

        // Verify cache invalidated only for valid product categories
        mockCache.Verify(m => m.Remove("products_list_all"), Times.Once);
        mockCache.Verify(m => m.Remove("products_list_laptops"), Times.Once);
        mockCache.Verify(m => m.Remove("products_list_accessories"), Times.Once);
    }

    [Fact]
    public async Task Should_Handle_Total_Excel_Validation_Errors_Without_Persisting_Or_Evicting_Cache()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();
        var mockCache = new Mock<IMemoryCache>();

        var emptyValidProducts = new List<ProductItem>();
        var totalErrors = new List<string>
        {
            "Row 2: Product Name is required.",
            "Row 3 (Bad Item): Category is required.",
            "Row 4 (Bad Price): Invalid Price value '0'. Price must be a positive decimal."
        };

        mockExcelService
            .Setup(x => x.ImportProductsFromExcelAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((emptyValidProducts, totalErrors));

        var handler = new ImportProductsCommandHandler(context, mockExcelService.Object, mockCache.Object);
        using var stream = new MemoryStream();
        var command = new ImportProductsCommand(stream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Be("Successfully imported 0 products. 3 errors encountered.");
        result.Data.Should().NotBeNull();
        result.Data!.ImportedCount.Should().Be(0);
        result.Data.ErrorCount.Should().Be(3);
        result.Data.Errors.Should().HaveCount(3);

        // DbContext must remain completely empty
        var dbProducts = await context.Products.ToListAsync();
        dbProducts.Should().BeEmpty();

        // Cache eviction must NOT be triggered when 0 products are imported
        mockCache.Verify(m => m.Remove(It.IsAny<object>()), Times.Never);
    }

    [Fact]
    public async Task Should_Handle_Empty_Worksheet_Error_Gracefully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();
        var mockCache = new Mock<IMemoryCache>();

        mockExcelService
            .Setup(x => x.ImportProductsFromExcelAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<ProductItem>(), new List<string> { "The uploaded Excel workbook contains no readable worksheet data." }));

        var handler = new ImportProductsCommandHandler(context, mockExcelService.Object, mockCache.Object);
        using var stream = new MemoryStream();
        var command = new ImportProductsCommand(stream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.ImportedCount.Should().Be(0);
        result.Data.ErrorCount.Should().Be(1);
        result.Data.Errors.Should().ContainSingle().Which.Should().Contain("no readable worksheet data");

        mockCache.Verify(m => m.Remove(It.IsAny<object>()), Times.Never);
    }

    [Fact]
    public async Task Should_Process_Real_Excel_Binary_End_To_End()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var excelService = new ExcelService(NullLogger<ExcelService>.Instance);
        var handler = new ImportProductsCommandHandler(context, excelService, memoryCache);

        // Prepopulate cache to verify eviction
        memoryCache.Set("products_list_all", "old_cached_all");
        memoryCache.Set("products_list_smartphones", "old_cached_phones");

        // Create in-memory Excel package with valid and invalid rows
        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("Products");
        ws.Cells[1, 1].Value = "Product Name";
        ws.Cells[1, 2].Value = "Category";
        ws.Cells[1, 3].Value = "Price";
        ws.Cells[1, 4].Value = "Stock";

        // Row 2: Valid
        ws.Cells[2, 1].Value = "Google Pixel 9 Pro";
        ws.Cells[2, 2].Value = "Smartphones";
        ws.Cells[2, 3].Value = 999.00;
        ws.Cells[2, 4].Value = 35;

        // Row 3: Invalid Price (negative)
        ws.Cells[3, 1].Value = "Corrupt Smartphone";
        ws.Cells[3, 2].Value = "Smartphones";
        ws.Cells[3, 3].Value = -50.00;
        ws.Cells[3, 4].Value = 10;

        // Row 4: Valid
        ws.Cells[4, 1].Value = "Galaxy Tab S9";
        ws.Cells[4, 2].Value = "Tablets";
        ws.Cells[4, 3].Value = "$799.50";
        ws.Cells[4, 4].Value = "20";

        var excelBytes = package.GetAsByteArray();
        using var stream = new MemoryStream(excelBytes);

        var command = new ImportProductsCommand(stream);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data!.ImportedCount.Should().Be(2);
        result.Data.ErrorCount.Should().Be(1);
        result.Data.Errors.Should().ContainSingle(e => e.Contains("Row 3") && e.Contains("Invalid Price"));

        // Verify database contains 2 valid items
        var products = await context.Products.ToListAsync();
        products.Should().HaveCount(2);
        products.Should().Contain(p => p.Name == "Google Pixel 9 Pro" && p.Price == 999.00m && p.StockQuantity == 35);
        products.Should().Contain(p => p.Name == "Galaxy Tab S9" && p.Price == 799.50m && p.StockQuantity == 20);

        // Verify cache keys were evicted
        memoryCache.TryGetValue("products_list_all", out _).Should().BeFalse();
        memoryCache.TryGetValue("products_list_smartphones", out _).Should().BeFalse();
    }
}
