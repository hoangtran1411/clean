using CleanArch.Application.Features.Dashboard.Queries.GetDashboardMetrics;
using CleanArch.Domain.Entities;
using CleanArch.Domain.Enums;
using CleanArch.UnitTests.Common;
using FluentAssertions;
using Xunit;

namespace CleanArch.UnitTests.Features.Dashboard.Queries;

public class GetDashboardMetricsQueryTests
{
    [Fact]
    public async Task Handle_ShouldReturnAccurateLiveMetricsAndTelemetry()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        // Seed products
        context.Products.AddRange(
            new ProductItem { Name = "ThinkPad X1", Category = "Laptops", Price = 1500, StockQuantity = 15 },
            new ProductItem { Name = "MacBook Pro 16", Category = "Laptops", Price = 2400, StockQuantity = 5 },
            new ProductItem { Name = "Dell PowerEdge", Category = "Servers", Price = 4500, StockQuantity = 2 }
        );

        // Seed payment
        context.Payments.Add(
            new PaymentRecord { Amount = 1500, Currency = "USD", OrderReference = "ORD-TEST", Status = "COMPLETED", ProcessedBy = "tester" }
        );

        // Seed workflow request
        context.WorkflowRequests.Add(
            new WorkflowRequest
            {
                Title = "Test Server Upgrade",
                Description = "Testing dashboard aggregation",
                WorkflowTemplateId = 1,
                Status = WorkflowStatus.InApproval,
                CurrentApprovalLevel = 1,
                TotalApprovalLevels = 3,
                RequestedByUserId = "usr-1",
                RequestedByUserName = "Dev"
            }
        );

        await context.SaveChangesAsync();

        var handler = new GetDashboardMetricsQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetDashboardMetricsQuery("month"), CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Kpis.TotalProducts.Should().Be(3);
        result.Data.Kpis.LowStockProducts.Should().Be(2); // stock < 10
        result.Data.Kpis.ActiveWorkflows.Should().Be(1);
        result.Data.Kpis.TotalPaymentsCount.Should().Be(1);
        result.Data.CategoryDistribution.Should().HaveCount(2); // Laptops, Servers
        result.Data.SystemTelemetry.Should().NotBeNull();
        result.Data.SystemTelemetry.MemoryUsageMb.Should().BeGreaterThan(0);
        result.Data.SystemTelemetry.DotNetVersion.Should().Contain(".NET");
    }
}
