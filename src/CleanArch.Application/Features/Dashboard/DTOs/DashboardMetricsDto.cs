namespace CleanArch.Application.Features.Dashboard.DTOs;

public class DashboardMetricsDto
{
    public KpiMetricsDto Kpis { get; set; } = new();
    public List<CategoryBreakdownDto> CategoryDistribution { get; set; } = [];
    public List<RevenuePointDto> RevenueTimeSeries { get; set; } = [];
    public List<ApprovalLevelVelocityDto> ApprovalVelocity { get; set; } = [];
    public List<DashboardActivityDto> RecentActivities { get; set; } = [];
    public SystemTelemetryDto SystemTelemetry { get; set; } = new();
}

public class KpiMetricsDto
{
    public decimal TotalRevenue { get; set; }
    public decimal PriorMonthRevenue { get; set; }
    public decimal RevenueGrowthPercent { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int ActiveWorkflows { get; set; }
    public int CompletedWorkflows { get; set; }
    public int TotalPaymentsCount { get; set; }
    public double CacheHitRatio { get; set; } = 94.8;
    public double AverageLatencyMs { get; set; } = 12.4;
}

public class CategoryBreakdownDto
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
    public string Color { get; set; } = string.Empty;
}

public class RevenuePointDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class ApprovalLevelVelocityDto
{
    public int Level { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AvgHours { get; set; } = string.Empty;
    public int PendingCount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class DashboardActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // workflow, order, auth, system
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // success, pending, warning, info
    public string User { get; set; } = string.Empty;
}

public class SystemTelemetryDto
{
    public string Uptime { get; set; } = string.Empty;
    public double MemoryUsageMb { get; set; }
    public string GcMode { get; set; } = string.Empty;
    public int ThreadPoolWorkers { get; set; }
    public double DbLatencyMs { get; set; }
    public string EnvironmentName { get; set; } = string.Empty;
    public string DotNetVersion { get; set; } = string.Empty;
    public string OsDescription { get; set; } = string.Empty;
}
