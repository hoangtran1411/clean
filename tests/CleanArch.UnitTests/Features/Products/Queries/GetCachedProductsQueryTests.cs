using CleanArch.Application.Features.Products.Queries.GetCachedProducts;
using CleanArch.Domain.Entities;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace CleanArch.UnitTests.Features.Products.Queries;

public class GetCachedProductsQueryTests
{
    [Fact]
    public async Task Should_Return_All_Products_And_Populate_Cache_On_Cache_Miss()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<GetCachedProductsQueryHandler>.Instance;

        await context.Products.AddRangeAsync(
            new ProductItem { Name = "MacBook Pro", Category = "Laptops", Price = 2500m, StockQuantity = 10 },
            new ProductItem { Name = "Sony WH-1000XM5", Category = "Audio", Price = 400m, StockQuantity = 20 }
        );
        await context.SaveChangesAsync();

        var handler = new GetCachedProductsQueryHandler(context, memoryCache, logger);
        var query = new GetCachedProductsQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data.Should().Contain(p => p.Name == "MacBook Pro");
        result.Data.Should().Contain(p => p.Name == "Sony WH-1000XM5");

        // Verify cache was populated
        memoryCache.TryGetValue("products_list_all", out var cachedValue).Should().BeTrue();
        cachedValue.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Filter_By_Category_And_Populate_Category_Specific_Cache_Key()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<GetCachedProductsQueryHandler>.Instance;

        await context.Products.AddRangeAsync(
            new ProductItem { Name = "Dell XPS 13", Category = "Laptops", Price = 1200m, StockQuantity = 8 },
            new ProductItem { Name = "AirPods Max", Category = "Audio", Price = 549m, StockQuantity = 15 }
        );
        await context.SaveChangesAsync();

        var handler = new GetCachedProductsQueryHandler(context, memoryCache, logger);
        var query = new GetCachedProductsQuery(Category: "Laptops");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().HaveCount(1);
        result.Data.Single().Name.Should().Be("Dell XPS 13");
        result.Data.Single().Category.Should().Be("Laptops");

        // Verify category cache key was populated
        memoryCache.TryGetValue("products_list_laptops", out var cachedValue).Should().BeTrue();
        cachedValue.Should().NotBeNull();
    }

    [Fact]
    public async Task Should_Return_Cached_Results_Directly_On_Cache_Hit_Without_Querying_Database()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var logger = NullLogger<GetCachedProductsQueryHandler>.Instance;

        // Populate database with initial item
        await context.Products.AddAsync(new ProductItem { Name = "Initial Laptop", Category = "Laptops", Price = 1000m, StockQuantity = 5 });
        await context.SaveChangesAsync();

        var handler = new GetCachedProductsQueryHandler(context, memoryCache, logger);

        // First call: Cache miss, loads from DB
        var firstResult = await handler.Handle(new GetCachedProductsQuery("Laptops"), CancellationToken.None);
        firstResult.Data.Should().HaveCount(1);

        // Mutate database directly (add another item without going through Command handler cache eviction)
        await context.Products.AddAsync(new ProductItem { Name = "Uncached Laptop", Category = "Laptops", Price = 1500m, StockQuantity = 10 });
        await context.SaveChangesAsync();

        // Second call: Cache hit, returns cached data (1 item, not 2)
        var secondResult = await handler.Handle(new GetCachedProductsQuery("Laptops"), CancellationToken.None);
        secondResult.Data.Should().HaveCount(1);
        secondResult.Data.Single().Name.Should().Be("Initial Laptop");
    }
}
