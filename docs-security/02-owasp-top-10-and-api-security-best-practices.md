# 02 - OWASP Top 10 & API Security Best Practices

The Open Web Application Security Project (OWASP) maintains the authoritative baseline of web application and API security risks. This module analyzes the top vulnerabilities and provides concrete prevention patterns in **.NET 10** and modern frontend frameworks.

---

## 1. OWASP API Security Top 10 Overview

```text
                               ┌─────────────────────────────────────────┐
                               │       OWASP API SECURITY TOP 10         │
                               ├─────────────────────────────────────────┤
                               │ API1: Broken Object Level Auth (BOLA)   │
                               │ API2: Broken Authentication             │
                               │ API3: Broken Object Property Level Auth │
                               │ API4: Unrestricted Resource Consumption │
                               │ API5: Broken Function Level Auth (BFLA) │
                               │ API6: Unrestricted Access to Flows      │
                               │ API7: Server-Side Request Forgery (SSRF)│
                               │ API8: Security Misconfiguration         │
                               │ API9: Improper Inventory Management     │
                               │ API10: Unsafe Consumption of APIs       │
                               └─────────────────────────────────────────┘
```

---

## 2. Deep-Dive: Critical OWASP Vulnerabilities & .NET Fixes

### A. API1: Broken Object Level Authorization (BOLA / IDOR)

**The Vulnerability**: An attacker alters the ID parameter in an API request (e.g. `GET /api/orders/1234` ➔ `GET /api/orders/1235`) to access another customer's private data.

**❌ Vulnerable Code**:

```csharp
[HttpGet("orders/{id:guid}")]
public async Task<IActionResult> GetOrder(Guid id)
{
    // Fetches order purely by ID without validating if the caller owns it!
    var order = await _dbContext.Orders.FindAsync(id);
    return Ok(order);
}
```

**✅ Secure Pattern with User Context & Tenant Isolation**:

```csharp
[HttpGet("orders/{id:guid}")]
[Authorize]
public async Task<IActionResult> GetOrder(Guid id, [FromServices] ICurrentUserService currentUserService)
{
    var currentUserId = currentUserService.UserId;
    
    // Explicitly scope the query to the authenticated caller's UserId
    var order = await _dbContext.Orders
        .AsNoTracking()
        .Where(o => o.Id == id && o.UserId == currentUserId)
        .Select(o => new OrderDto(o.Id, o.TotalAmount, o.CreatedAtUtc))
        .FirstOrDefaultAsync();

    if (order is null)
    {
        // Return 404 to avoid leaking whether the ID exists
        return NotFound(new ProblemDetails
        {
            Title = "Resource not found",
            Status = StatusCodes.Status404NotFound,
            Detail = $"Order '{id}' does not exist or you do not have permission to view it."
        });
    }

    return Ok(order);
}
```

---

### B. API3: Broken Object Property Level Authorization (Mass Assignment)

**The Vulnerability**: Over-posting sensitive fields during entity creation or updating (e.g., passing `"isAdmin": true` or `"role": "SuperAdmin"` in an update profile request body).

**❌ Vulnerable Code**:

```csharp
[HttpPut("profile")]
public async Task<IActionResult> UpdateProfile([FromBody] ApplicationUser userUpdate)
{
    // Directly binding request JSON to database entity model!
    _dbContext.Users.Update(userUpdate); 
    await _dbContext.SaveChangesAsync();
    return Ok();
}
```

**✅ Secure Pattern with Explicit CQRS DTOs**:

```csharp
// 1. Strict Request DTO exposing only allowed fields
public sealed record UpdateUserProfileCommand(
    string FullName,
    string PhoneNumber) : IRequest<Result<UserProfileDto>>;

// 2. MediatR Handler mutating only permitted properties
public class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand, Result<UserProfileDto>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public async Task<Result<UserProfileDto>> Handle(UpdateUserProfileCommand request, CancellationToken ct)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, ct);
        if (user is null) return Result<UserProfileDto>.Failure("User not found.");

        // Explicit field mapping - NO automatic over-posting
        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber.Trim();

        await _context.SaveChangesAsync(ct);
        return Result<UserProfileDto>.Success(new UserProfileDto(user.Id, user.FullName, user.Email!));
    }
}
```

---

### C. API7: Server-Side Request Forgery (SSRF)

**The Vulnerability**: An application accepts a remote URL from a user (e.g., webhook URL, avatar URL) and fetches it without validating if it targets internal infrastructure (e.g., `http://169.254.169.254/latest/meta-data` for AWS metadata, or `http://localhost:6379` for internal Redis).

**✅ Secure SSRF Prevention Validator**:

```csharp
public static class UrlSecurityValidator
{
    public static bool IsSafePublicHttpUrl(string urlString)
    {
        if (!Uri.TryCreate(urlString, UriKind.Absolute, out var uri))
            return false;

        // 1. Only allow HTTP and HTTPS
        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            return false;

        // 2. Reject localhost and loopback
        if (uri.IsLoopback)
            return false;

        // 3. Resolve DNS and verify IP is not in private/internal subnet
        try
        {
            var hostEntry = Dns.GetHostEntry(uri.DnsSafeHost);
            foreach (var address in hostEntry.AddressList)
            {
                if (IPAddress.IsLoopback(address) || IsPrivateSubnet(address))
                    return false;
            }
        }
        catch
        {
            return false;
        }

        return true;
    }

    private static bool IsPrivateSubnet(IPAddress ip)
    {
        var bytes = ip.GetAddressBytes();
        if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
        {
            // 10.0.0.0/8
            if (bytes[0] == 10) return true;
            // 172.16.0.0/12
            if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;
            // 192.168.0.0/16
            if (bytes[0] == 192 && bytes[1] == 168) return true;
            // Link-local / Cloud metadata (169.254.0.0/16)
            if (bytes[0] == 169 && bytes[1] == 254) return true;
        }
        return false;
    }
}
```

---

### D. SQL Injection & EF Core Raw Queries

EF Core LINQ queries are completely parameterized by default. However, when using raw SQL, **never** concatenate unvalidated strings:

```csharp
// ❌ HIGH RISK: SQL Injection
string filter = request.Category;
var products = await _context.Products
    .FromSqlRaw($"SELECT * FROM Products WHERE Category = '{filter}'") // Vulnerable!
    .ToListAsync();

// ✅ SECURE: Formattable String Parameterization
var products = await _context.Products
    .FromSqlInterpolated($"SELECT * FROM Products WHERE Category = {filter}") // EF Core parameterizes this automatically!
    .ToListAsync();
```

---

## 3. API Security Checklist

| Category | Best Practice | Implementation |
| :--- | :--- | :--- |
| **Transport** | Enforce TLS 1.3 only | Reverse proxy / Kestrel `HttpProtocols.Http1AndHttp2AndHttp3` |
| **Headers** | Content Security Policy & Anti-Sniff | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |
| **Payload Limits** | Reject oversized request bodies | `builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 10 * 1024 * 1024);` |
| **Content Type** | Enforce strict `application/json` | Reject requests lacking expected `Content-Type` header |
| **Error Handling** | Never leak stack traces | Use RFC 7807 `ProblemDetails` via `app.UseExceptionHandler()` |
