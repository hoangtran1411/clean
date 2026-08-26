# 06 - Network Security, CORS, CSRF & Defensive HTTP Headers

Securing HTTP transport and controlling cross-origin behavior prevents attacks such as Cross-Origin Resource Sharing (CORS) misconfigurations, Cross-Site Request Forgery (CSRF), Clickjacking, and MIME-sniffing.

---

## 1. Cross-Origin Resource Sharing (CORS) Demystified

CORS is a **browser security mechanism** (enforced by the browser, not the server) that controls whether a web application on origin `https://frontend.example.com` can read HTTP responses from `https://api.example.com`.

```
Frontend (http://localhost:3000)                   Backend API (http://localhost:5000)
       │                                                          │
       ├─── Preflight OPTIONS /api/products ─────────────────────►│
       │    Origin: http://localhost:3000                        │
       │    Access-Control-Request-Method: POST                   │
       │                                                          │
       │◄── Response: 204 No Content ─────────────────────────────┤
       │    Access-Control-Allow-Origin: http://localhost:3000    │
       │    Access-Control-Allow-Methods: GET, POST, PUT, DELETE  │
       │    Access-Control-Allow-Headers: Authorization, Content-Type
       │                                                          │
       ├─── Actual Request: POST /api/products ──────────────────►│
       │◄── Response: 201 Created ────────────────────────────────┤
```

### ❌ Dangerous CORS Misconfigurations
- `AllowAnyOrigin()` + `AllowCredentials()`: Browsers forbid wildcard origins with credentials, but improper reflection (echoing `Origin` header dynamically) allows malicious sites to steal authenticated data!
- Leaving `localhost` enabled in Production environments.

### ✅ Production CORS Setup in ASP.NET Core
```csharp
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("StrictEnterprisePolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
              .WithHeaders("Authorization", "Content-Type", "X-Correlation-ID", "Idempotency-Key")
              .WithExposedHeaders("X-Correlation-ID", "X-Pagination-TotalPages")
              .SetPreflightMaxAge(TimeSpan.FromHours(1)); // Cache preflight response
    });
});
```

---

## 2. CSRF (Cross-Site Request Forgery) Protection

CSRF occurs when a malicious site tricks a user's browser into executing unwanted actions on a trusted site where the user is currently authenticated via cookies.

```
┌─────────────────────────────────────────────────────────────┐
│ COOKIE AUTHENTICATION vs. BEARER TOKEN IN API ARCHITECTURE  │
├─────────────────────────────────────────────────────────────┤
│ 1. Cookie Auth (Needs Anti-Forgery Tokens & SameSite=Strict)│
│    - Browsers automatically attach cookies to cross-origin  │
│      requests unless SameSite is properly configured.       │
│                                                             │
│ 2. Bearer Token Auth (Header: Authorization: Bearer <JWT>)  │
│    - Immune to classic CSRF because browsers NEVER          │
│      automatically send custom HTTP headers cross-origin!   │
└─────────────────────────────────────────────────────────────┘
```

### Cookie Hardening Flags
If using authentication cookies:
```csharp
options.Cookie.HttpOnly = true;                 // Inaccessible to JavaScript (mitigates XSS cookie theft)
options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
options.Cookie.SameSite = SameSiteMode.Strict;  // Do not send on cross-site requests
```

---

## 3. Essential Security HTTP Headers Middleware

Injecting defense-in-depth HTTP headers stops clickjacking, MIME-type sniffing, and enforces strict HTTPS.

```csharp
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        // 1. Prevent MIME-Type Sniffing
        headers.Append("X-Content-Type-Options", "nosniff");

        // 2. Prevent Clickjacking (framing)
        headers.Append("X-Frame-Options", "DENY");

        // 3. Control Referrer Information Leaks
        headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // 4. Disable risky browser features
        headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

        // 5. Strict Content Security Policy (CSP)
        headers.Append("Content-Security-Policy", 
            "default-src 'self'; " +
            "script-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' http://localhost:5000 https://api.production.com; " +
            "frame-ancestors 'none'; " +
            "object-src 'none';");

        // 6. HTTP Strict Transport Security (HSTS - 1 Year + Subdomains)
        if (context.Request.IsHttps)
        {
            headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }

        await _next(context);
    }
}
```

---

## 4. Testing Headers with Security Analyzers
Verify your headers against [SecurityHeaders.com](https://securityheaders.com) or via curl:
```bash
curl -I https://localhost:5000/api/products
```
Ensure that all security headers return `A+` grade metrics.
