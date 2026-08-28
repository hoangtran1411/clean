using CleanArch.Application.Features.Products.Commands.CreateProduct;
using CleanArch.Application.Features.Products.Queries.GetCachedProducts;
using CleanArch.Domain.Entities;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using FluentValidation.TestHelper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

namespace CleanArch.UnitTests.Features.Products.Commands;

public class CreateProductCommandValidatorTests
{
    private readonly CreateProductCommandValidator _validator = new();

    [Fact]
    public void Should_Pass_Validation_When_Command_Is_Valid()
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "Apple Vision Pro",
            Category: "Virtual Reality",
            Price: 3499.99m,
            StockQuantity: 10);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_Fail_Validation_When_Name_Is_Empty_Or_Whitespace(string? invalidName)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: invalidName!,
            Category: "Smartphones",
            Price: 999.00m,
            StockQuantity: 5);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_Validation_When_Name_Exceeds_200_Characters()
    {
        // Arrange
        var longName = new string('A', 201);
        var command = new CreateProductCommand(
            Name: longName,
            Category: "Laptops",
            Price: 1500.00m,
            StockQuantity: 10);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Name)
            .WithErrorMessage("The length of 'Name' must be 200 characters or fewer. You entered 201 characters.");
    }

    [Fact]
    public void Should_Pass_Validation_When_Name_Is_Exactly_200_Characters()
    {
        // Arrange
        var exactName = new string('B', 200);
        var command = new CreateProductCommand(
            Name: exactName,
            Category: "Laptops",
            Price: 1500.00m,
            StockQuantity: 10);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Name);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Should_Fail_Validation_When_Category_Is_Empty_Or_Whitespace(string? invalidCategory)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "Sony WH-1000XM5",
            Category: invalidCategory!,
            Price: 399.99m,
            StockQuantity: 25);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Fact]
    public void Should_Fail_Validation_When_Category_Exceeds_100_Characters()
    {
        // Arrange
        var longCategory = new string('C', 101);
        var command = new CreateProductCommand(
            Name: "Mechanical Keyboard",
            Category: longCategory,
            Price: 120.00m,
            StockQuantity: 15);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Fact]
    public void Should_Pass_Validation_When_Category_Is_Exactly_100_Characters()
    {
        // Arrange
        var exactCategory = new string('C', 100);
        var command = new CreateProductCommand(
            Name: "Mechanical Keyboard",
            Category: exactCategory,
            Price: 120.00m,
            StockQuantity: 15);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Category);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.01)]
    [InlineData(-100.50)]
    public void Should_Fail_Validation_When_Price_Is_Zero_Or_Negative(decimal invalidPrice)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "Wireless Mouse",
            Category: "Accessories",
            Price: invalidPrice,
            StockQuantity: 50);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Theory]
    [InlineData(0.01)]
    [InlineData(1.00)]
    [InlineData(9999.99)]
    public void Should_Pass_Validation_When_Price_Is_Positive(decimal validPrice)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "Wireless Mouse",
            Category: "Accessories",
            Price: validPrice,
            StockQuantity: 50);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.Price);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-50)]
    [InlineData(-1000)]
    public void Should_Fail_Validation_When_StockQuantity_Is_Negative(int invalidStock)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "USB-C Hub",
            Category: "Accessories",
            Price: 49.99m,
            StockQuantity: invalidStock);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(500)]
    public void Should_Pass_Validation_When_StockQuantity_Is_Zero_Or_Positive(int validStock)
    {
        // Arrange
        var command = new CreateProductCommand(
            Name: "USB-C Hub",
            Category: "Accessories",
            Price: 49.99m,
            StockQuantity: validStock);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveValidationErrorFor(x => x.StockQuantity);
    }
}

public class CreateProductCommandHandlerTests
{
    [Fact]
    public async Task Should_Successfully_Create_Product_And_Persist_In_DbContext()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockCache = new Mock<IMemoryCache>();
        var handler = new CreateProductCommandHandler(context, mockCache.Object);

        var command = new CreateProductCommand(
            Name: "Dell XPS 15 OLED",
            Category: "Laptops",
            Price: 1999.99m,
            StockQuantity: 12);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Be("Product created successfully and In-Memory cache invalidated.");
        result.Data.Should().NotBeNull();
        result.Data!.Id.Should().BeGreaterThan(0);
        result.Data.Name.Should().Be("Dell XPS 15 OLED");
        result.Data.Category.Should().Be("Laptops");
        result.Data.Price.Should().Be(1999.99m);
        result.Data.StockQuantity.Should().Be(12);
        result.Data.CreatedAtUtc.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));

        // Verify entity persisted in DbContext
        var persistedEntity = await context.Products.FirstOrDefaultAsync(p => p.Id == result.Data.Id);
        persistedEntity.Should().NotBeNull();
        persistedEntity!.Name.Should().Be("Dell XPS 15 OLED");
        persistedEntity.Category.Should().Be("Laptops");
        persistedEntity.Price.Should().Be(1999.99m);
        persistedEntity.StockQuantity.Should().Be(12);
    }

    [Fact]
    public async Task Should_Invalidate_Both_All_And_Category_Specific_Cache_Keys()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockCache = new Mock<IMemoryCache>();
        var handler = new CreateProductCommandHandler(context, mockCache.Object);

        var command = new CreateProductCommand(
            Name: "iPad Pro 13 M4",
            Category: "Tablets",
            Price: 1299.00m,
            StockQuantity: 30);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        var expectedAllKey = $"{GetCachedProductsQueryHandler.ProductsCacheKeyPrefix}all";
        var expectedCategoryKey = $"{GetCachedProductsQueryHandler.ProductsCacheKeyPrefix}tablets";

        mockCache.Verify(m => m.Remove(expectedAllKey), Times.Once);
        mockCache.Verify(m => m.Remove(expectedCategoryKey), Times.Once);
    }

    [Fact]
    public async Task Should_Invalidate_Category_Cache_Key_In_LowerCase_Even_If_Input_Has_Mixed_Casing()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var mockCache = new Mock<IMemoryCache>();
        var handler = new CreateProductCommandHandler(context, mockCache.Object);

        var command = new CreateProductCommand(
            Name: "Sony WH-1000XM5",
            Category: "AuDiO & HeAdPhOnEs",
            Price: 349.99m,
            StockQuantity: 20);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        mockCache.Verify(m => m.Remove("products_list_all"), Times.Once);
        mockCache.Verify(m => m.Remove("products_list_audio & headphones"), Times.Once);
    }

    [Fact]
    public async Task Should_Evict_Cached_Entries_When_Using_Real_MemoryCache_Instance()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());

        const string allKey = "products_list_all";
        const string laptopsKey = "products_list_laptops";
        const string phonesKey = "products_list_smartphones";

        memoryCache.Set(allKey, "cached_all_products");
        memoryCache.Set(laptopsKey, "cached_laptop_products");
        memoryCache.Set(phonesKey, "cached_phone_products");

        var handler = new CreateProductCommandHandler(context, memoryCache);
        var command = new CreateProductCommand(
            Name: "MacBook Air 15 M3",
            Category: "Laptops",
            Price: 1299.00m,
            StockQuantity: 25);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        // Evicted keys
        memoryCache.TryGetValue(allKey, out _).Should().BeFalse();
        memoryCache.TryGetValue(laptopsKey, out _).Should().BeFalse();

        // Untouched keys remain in cache
        memoryCache.TryGetValue(phonesKey, out var remainingVal).Should().BeTrue();
        remainingVal.Should().Be("cached_phone_products");
    }
}
