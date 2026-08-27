# 07 - Rate Limiting, DDoS Mitigation & API Defense Strategies

Rate limiting controls the consumption rate of API resources, protecting backend services from denial of service (DoS), brute-force attacks, scraping, and runaway client retries.

---

## 1. Rate Limiting Algorithms Comparison

```text
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Algorithm          │ How it Works                     │ Best Use Case                       │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Fixed Window       │ Resets count at fixed intervals  │ Simple, low memory; but vulnerable  │
│                    │ (e.g. 100 req / minute).         │ to traffic bursts at boundaries.    │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Sliding Window     │ Divides window into segments for │ Smooth rate limiting; prevents      │
│                    │ moving average calculation.      │ boundary spike vulnerability.       │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Token Bucket       │ Tokens fill at steady rate;      │ Allows short bursts up to bucket    │
│                    │ each request consumes a token.   │ capacity, then throttles to rate.   │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Concurrency Limiter│ Restricts maximum parallel       │ High-CPU / Heavy background tasks   │
│                    │ in-flight requests.              │ (Excel exports, report generation). │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. Implementing ASP.NET Core Built-in Rate Limiting

ASP.NET Core provides high-performance, non-allocating rate limiters under `Microsoft.AspNetCore.RateLimiting`.

### A. Register Rate Limiter Policies in `Program.cs`

```csharp
builder.Services.AddRateLimiter(options =>
{
    // 1. HTTP 429 Status Code with ProblemDetails rejection handler
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/problem+json";
        
        var retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retrySpan)
            ? retrySpan.TotalSeconds
            : 60;

        context.HttpContext.Response.Headers.Append("Retry-After", retryAfter.ToString());

        await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too Many Requests",
            Detail = $"Rate limit exceeded. Please try again after {retryAfter} seconds."
        }, token);
    };

    // 2. Strict Sliding Window Policy for Authentication (Prevents Brute-Force)
    options.AddSlidingWindowLimiter("AuthPolicy", opt =>
    {
        opt.PermitLimit = 5;                           // 5 attempts
        opt.Window = TimeSpan.FromMinutes(1);          // per 1 minute
        opt.SegmentsPerWindow = 6;                     // 10-second segments
        opt.QueueLimit = 0;                            // No queueing (fail immediately)
    });

    // 3. Partitioned Limiter by Client IP Address
    options.AddPolicy("IpPartitionPolicy", httpContext =>
    {
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown_ip";

        return RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: clientIp,
            factory: key => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 60,
                ReplenishmentPeriod = TimeSpan.FromSeconds(1),
                TokensPerPeriod = 2,
                AutoReplenishment = true,
                QueueLimit = 0
            });
    });

    // 4. Concurrency Policy for Heavy Operations (e.g. EPPlus Excel Import/Export)
    options.AddConcurrencyLimiter("HeavyExportPolicy", opt =>
    {
        opt.PermitLimit = 3;                           // Only 3 simultaneous export jobs
        opt.QueueLimit = 5;                            // Queue up to 5 requests
    });
});
```

### B. Applying Policies on Controllers

```csharp
[ApiController]
[Route("api/auth")]
[EnableRateLimiting("AuthPolicy")] // Strictly protected against credential stuffing
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command) => ...
}

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    [HttpGet("export")]
    [EnableRateLimiting("HeavyExportPolicy")] // Max 3 concurrent workers
    public async Task<IActionResult> Export() => ...
}
```

---

## 3. Regular Expression Denial of Service (ReDoS) Defense

Evaluating complex regular expressions against untrusted user input can cause exponential backtracking, locking the CPU core at 100%.

### C# 13 Source-Generated Regex with Strict Timeout

```csharp
public static partial class InputValidationRegex
{
    // C# Source Generator compiles the DFA at build time with an explicit 250ms timeout
    [GeneratedRegex(@"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 250)]
    public static partial Regex EmailRegex();
}
```

---

## 4. Request Size & Timeout Limits

```csharp
// Protect Kestrel from memory exhaustion
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 15 * 1024 * 1024; // 15MB limit
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(2);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15); // Protects against Slowloris attacks
});

// Configure ASP.NET Core Request Timeout middleware (.NET 8+)
builder.Services.AddRequestTimeouts(options =>
{
    options.DefaultPolicy = new RequestTimeoutPolicy
    {
        Timeout = TimeSpan.FromSeconds(30)
    };
});
```
