# 03 - Authentication & JWT Security Hardening

Authentication verifies **who** the client is. This guide explores state-of-the-art password hashing, JSON Web Token (JWT) hardening against common attacks, and production-grade Refresh Token Rotation.

---

## 1. Modern Password Hashing Benchmarks

Never store passwords in plain text or using outdated fast hash functions (MD5, SHA-1, SHA-256). Fast hashes enable attackers to test billions of combinations per second on consumer GPUs.

```text
       Hash Algorithm Speed Comparison (Attacker cracking cost):
       
       MD5 / SHA-256: ═══════════════════════════════════► (100 Billion guesses/sec on GPU - INSECURE)
       PBKDF2-HMAC-SHA512: ══════════► (100,000 iterations - Secure baseline in .NET Identity)
       BCrypt (Cost 12+): ═════► (High CPU cost, salt baked in)
       Argon2id: ══► (Memory-Hard + CPU-Hard: Immune to GPU/ASIC attacks - GOLD STANDARD)
```

### Password Hashing in ASP.NET Core Identity

ASP.NET Core Identity uses **PBKDF2 with HMAC-SHA512** and `100,000` iterations (Version 3 format):

- Format: `[0x01 (version)] [4-byte KeyDerivationPrf] [4-byte iteration count] [4-byte salt length] [128-bit salt] [256-bit subkey]`
- Automatically generates a cryptographically secure random salt per user.

---

## 2. JWT Vulnerabilities & Hardening Tactics

### A. Algorithm Confusion Attack (`alg: none` or RSA/HMAC mismatch)

- **Vulnerability**: An attacker changes `{"alg": "HS256"}` to `{"alg": "none"}` in the JWT header, strips the signature, and submits the token. Or if an API expects RS256 (asymmetric public key), an attacker signs the token using HMAC-SHA256 with the server's public key as the secret.
- **Fix in .NET 10**: Explicitly define `TokenValidationParameters`:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            
            ValidateIssuer = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            
            ValidateAudience = true,
            ValidAudience = configuration["Jwt:Audience"],
            
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30), // Prevent large drift tolerance (default is 5 mins!)
            
            RequireSignedTokens = true,
            RequireExpirationTime = true
        };
    });
```

---

### B. Access Token vs. Refresh Token Lifespans

```text
   ┌───────────────────────────┐           ┌────────────────────────────┐
   │ Access Token (JWT)        │           │ Refresh Token (Opaque GUID)│
   ├───────────────────────────┤           ├────────────────────────────┤
   │ Lifespan: 15 - 30 minutes │           │ Lifespan: 7 - 14 days      │
   │ Stored: In-Memory / Axios │           │ Stored: HttpOnly Cookie/DB │
   │ Stateles signature check  │           │ State stored in Database   │
   └───────────────────────────┘           └────────────────────────────┘
```

- **Short-lived Access Tokens**: Limits the damage window if a bearer token is intercepted.
- **Opaque Refresh Tokens**: Stored hashed in the database, allowing instant server-side revocation.

---

## 3. Refresh Token Rotation & Stolen Token Detection

Refresh Token Rotation ensures that **every time a refresh token is used, it is invalidated and replaced with a new one**. If an attacker steals a token and attempts to use it after the legitimate user already used it (or vice-versa), the system detects token reuse and invalidates the entire token family!

```text
     Legitimate Flow:
     Client ─── (Token A) ───► Server (Validates A, Revokes A, Issues Token B) ───► Client stores B

     Attacker Interception (Token Reuse Scenario):
     Attacker ─── (Replays Token A) ───► Server: "Token A is already REVOKED!"
                                                │
                                                ▼
                                   🚨 SECURITY COMPROMISE DETECTED!
                                   Revoke ALL tokens for this User ID!
                                   Force User to log in again.
```

### C# Implementation of Token Reuse Detection

```csharp
public async Task<Result<AuthResponse>> RefreshTokenAsync(string refreshToken, string ipAddress, CancellationToken ct)
{
    var tokenRecord = await _dbContext.RefreshTokens
        .Include(r => r.User)
        .FirstOrDefaultAsync(r => r.Token == refreshToken, ct);

    if (tokenRecord is null)
    {
        return Result<AuthResponse>.Failure("Invalid refresh token.");
    }

    // 🚨 REUSE DETECTION: If an already-revoked token is presented, compromise occurred!
    if (tokenRecord.IsRevoked)
    {
        _logger.LogWarning("Security Alert: Attempted reuse of revoked token family for User {UserId} from IP {IP}",
            tokenRecord.UserId, ipAddress);

        // Revoke ALL active tokens belonging to this user immediately
        var activeTokens = await _dbContext.RefreshTokens
            .Where(r => r.UserId == tokenRecord.UserId && !r.IsRevoked)
            .ToListAsync(ct);

        foreach (var active in activeTokens)
        {
            active.IsRevoked = true;
            active.RevokedReason = "Revoked due to token family reuse attempt";
            active.RevokedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(ct);
        return Result<AuthResponse>.Failure("Security violation detected. All sessions terminated. Please log in again.");
    }

    // Check expiration
    if (tokenRecord.ExpiresAtUtc <= DateTime.UtcNow)
    {
        return Result<AuthResponse>.Failure("Refresh token has expired.");
    }

    // 1. Invalidate current token
    tokenRecord.IsRevoked = true;
    tokenRecord.RevokedAtUtc = DateTime.UtcNow;
    tokenRecord.RevokedReason = "Replaced by new token rotation";

    // 2. Generate new token pair
    var newAccessToken = _tokenService.GenerateJwtToken(tokenRecord.User);
    var newRefreshToken = new RefreshToken
    {
        Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
        UserId = tokenRecord.UserId,
        ExpiresAtUtc = DateTime.UtcNow.AddDays(7),
        CreatedByIp = ipAddress,
        CreatedAtUtc = DateTime.UtcNow
    };

    _dbContext.RefreshTokens.Add(newRefreshToken);
    await _dbContext.SaveChangesAsync(ct);

    return Result<AuthResponse>.Success(new AuthResponse(newAccessToken, newRefreshToken.Token));
}
```

---

## 4. Key Takeaways for Frontend Security

1. **Never store JWTs in `localStorage` if XSS is possible**: If storing in `localStorage`, ensure strict CSP and sanitization. In banking or high-security apps, store refresh tokens in `HttpOnly; Secure; SameSite=Strict` cookies.
2. **Handle 401s Transparently**: Use Axios response interceptors to queue failed requests while rotating the token, preventing multiple simultaneous refresh calls.
