using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Features.Products.DTOs;
using CleanArch.Application.Features.Products.Queries.ExportProducts;
using CleanArch.Domain.Entities;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using Moq;
using Xunit;

namespace CleanArch.UnitTests.Features.Products.Queries;

public class ExportProductsQueryTests
{
    [Fact]
    public async Task Should_Query_All_Products_And_Pass_To_ExcelService_When_Category_Is_Null()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();

        await context.Products.AddRangeAsync(
            new ProductItem { Name = "MacBook", Category = "Laptops", Price = 2000m, StockQuantity = 10 },
            new ProductItem { Name = "iPad", Category = "Tablets", Price = 800m, StockQuantity = 20 }
        );
        await context.SaveChangesAsync();

        var expectedBytes = new byte[] { 0x50, 0x4B, 0x03, 0x04 }; // zip/xlsx magic bytes
        mockExcelService
            .Setup(x => x.ExportProductsToExcel(It.Is<IEnumerable<ProductDto>>(list => list.Count() == 2)))
            .Returns(expectedBytes);

        var handler = new ExportProductsQueryHandler(context, mockExcelService.Object);
        var query = new ExportProductsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(expectedBytes);
        mockExcelService.Verify(x => x.ExportProductsToExcel(It.Is<IEnumerable<ProductDto>>(list => list.Count() == 2)), Times.Once);
    }

    [Fact]
    public async Task Should_Filter_Products_By_Category_Before_Passing_To_ExcelService()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockExcelService = new Mock<IExcelService>();

        await context.Products.AddRangeAsync(
            new ProductItem { Name = "MacBook", Category = "Laptops", Price = 2000m, StockQuantity = 10 },
            new ProductItem { Name = "Dell XPS", Category = "Laptops", Price = 1800m, StockQuantity = 15 },
            new ProductItem { Name = "iPad", Category = "Tablets", Price = 800m, StockQuantity = 20 }
        );
        await context.SaveChangesAsync();

        var expectedBytes = new byte[] { 0x11, 0x22, 0x33 };
        mockExcelService
            .Setup(x => x.ExportProductsToExcel(It.Is<IEnumerable<ProductDto>>(list => list.Count() == 2 && list.All(p => p.Category == "Laptops"))))
            .Returns(expectedBytes);

        var handler = new ExportProductsQueryHandler(context, mockExcelService.Object);
        var query = new ExportProductsQuery("Laptops");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(expectedBytes);
        mockExcelService.Verify(x => x.ExportProductsToExcel(It.Is<IEnumerable<ProductDto>>(list => list.Count() == 2 && list.All(p => p.Category == "Laptops"))), Times.Once);
    }
}
