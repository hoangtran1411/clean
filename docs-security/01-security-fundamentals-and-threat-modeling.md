# 01 - Security Fundamentals, Zero Trust & Threat Modeling

## 1. The Core Security Principles

Building enterprise software demands a security-first mindset across architecture, development, and operations.

```text
                   ┌──────────────────────────────────────┐
                   │           CONFIDENTIALITY            │
                   │  - Encryption (AES-256, TLS 1.3)     │
                   │  - Least Privilege Access Control    │
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────┴───────────────────┐
                   │              INTEGRITY               │
                   │  - Cryptographic Hashes (SHA-512)    │
                   │  - Digital Signatures (HMAC, RSA)    │
                   │  - Immutable Audit Logs              │
                   └──────────────────┬───────────────────┘
                                      │
                   ┌──────────────────┴───────────────────┐
                   │             AVAILABILITY             │
                   │  - Distributed Rate Limiting         │
                   │  - Circuit Breakers & Auto-Scaling   │
                   │  - Idempotency & Replay Protection   │
                   └──────────────────────────────────────┘
```

### A. The CIA Triad

1. **Confidentiality**: Ensuring data is accessible only to authorized entities (e.g., JWT token verification, RBAC permissions, encrypted secrets).
2. **Integrity**: Safeguarding the accuracy and completeness of information (e.g., cryptographic signatures, request hashing, non-repudiation audit trails).
3. **Availability**: Ensuring authorized users have reliable and timely access to resources (e.g., DDoS defenses, Redis caching, rate limiting).

### B. Defense in Depth (Layered Defense)

Never rely on a single defensive barrier. If an attacker breaches the perimeter WAF, application-level authorization, validation pipelines, and database row-level security must still stop them:

- **Perimeter Layer**: Cloudflare / AWS CloudFront WAF, TLS termination, IP rate limiting.
- **Network Layer**: Private subnets, VPC peering, isolated database endpoints.
- **Application Layer**: ASP.NET Core `CorrelationIdMiddleware`, Rate Limiting, CORS origin whitelisting, ProblemDetails error masking.
- **Authentication & Authorization**: Bearer JWT validation, Claims-based authorization, dynamic permission evaluation (`[HasPermission]`).
- **Pipeline Layer**: MediatR `ValidationBehavior` using FluentValidation, input boundary sanitization.
- **Data Layer**: EF Core parameterized SQL queries, encrypted fields at rest, least-privilege DB connection strings.

---

## 2. Zero Trust Architecture (ZTA)

Traditional security models relied on a **"castle-and-moat"** approach: anything inside the corporate network was trusted. Zero Trust operates on three fundamental tenets:

1. **Verify Explicitly**: Authenticate and authorize based on all available data points (identity, location, device health, service workload, data classification).
2. **Use Least Privilege Access**: Limit user and service access with Just-In-Time (JIT) and Just-Enough-Access (JEA), dynamic policies, and data protection.
3. **Assume Breach**: Minimize blast radius by segmenting access by network, user, devices, and application awareness. Encrypt all sessions end-to-end.

```text
    Traditional Perimeter Model:
    [Untrusted Internet] ─── WAF/Firewall ───► [Trusted Internal Network (All Services Trust Each Other)]

    Zero Trust Model:
    [Any Client/Service] ─── Token Auth + mTLS + Dynamic Policy ───► [Microservice A]
                                                                            │
                                                       Token Auth + mTLS ───┼───► [Microservice B]
                                                                            │
                                                       Token Auth + mTLS ───┴───► [Database / Redis]
```

---

## 3. STRIDE Threat Modeling

STRIDE is a mnemonic threat classification system developed by Microsoft to identify software vulnerabilities during architectural design.

| Threat | Security Property Violated | Definition | Real-World Example | Mitigation in .NET / Clean Arch |
| :--- | :--- | :--- | :--- | :--- |
| **S**poofing | **A**uthentication | Pretending to be someone or something else. | Attacker replays stolen credentials or creates forged JWTs. | JWT signature verification (`HS256`/`RS256`), Refresh Token rotation with automatic family revocation. |
| **T**ampering | **I**ntegrity | Modifying data in transit or at rest without authorization. | Altering a payment amount or product price in the request body. | MediatR FluentValidation, HMAC request signatures, database constraints. |
| **R**epudiation | **N**on-repudiation | Denying an action performed without proof. | User claims they never initiated a high-value money transfer. | Immutable audit logs (`SaveChangesInterceptor`), correlation IDs, capturing user ID and IP address. |
| **I**nformation Disclosure | **C**onfidentiality | Exposing sensitive data to unauthorized parties. | Stack traces leaked in 500 error responses; PII logged in plain text. | Global `IExceptionHandler` returning RFC ProblemDetails, Serilog destructuring with PII masking. |
| **D**enial of Service | **A**vailability | Exhausting system resources to prevent legitimate use. | Slowloris HTTP attacks, ReDoS (regex denial of service), unbounded DB queries. | ASP.NET Core RateLimiter middleware, C# 13 generated regex with timeouts, pagination limits (`Take(50)`). |
| **E**levation of Privilege | **A**uthorization | Gaining unauthorized capabilities or roles. | Normal user calls `/api/admin/grant-permission` directly. | Dynamic `IAuthorizationPolicyProvider`, `[HasPermission("...")]` on controller endpoints. |

---

## 4. DREAD Risk Assessment Matrix

When threats are identified, rate their severity using the DREAD scoring system (1 to 10 for each dimension, then calculate the average):

$$\text{Risk Score} = \frac{D + R + E + A + D}{5}$$

- **D - Damage Potential**: How severe is the impact if the attack succeeds? (10 = Full DB drop or server takeover).
- **R - Reproducibility**: How easy is it to duplicate the attack? (10 = Simple `curl` script works every time).
- **E - Exploitability**: What level of skill and tools are needed? (10 = Script kiddie using browser dev tools).
- **A - Affected Users**: How many users or systems are impacted? (10 = All enterprise tenants).
- **D - Discoverability**: How easily can an attacker discover the vulnerability? (10 = Visible in public OpenAPI / Scalar docs).

---

## 5. Security Checklist for Every Pull Request

- [ ] **No Hardcoded Secrets**: Check that connection strings, JWT secret keys, and API tokens are loaded via User Secrets or Environment Variables.
- [ ] **Authentication & Permissions**: Every non-public endpoint has `[Authorize]` and `[HasPermission("...")]`.
- [ ] **Input Validation**: Command and Query DTOs have corresponding FluentValidation rules checking string lengths, nullability, and allowable characters.
- [ ] **Safe SQL**: All database queries use EF Core LINQ or parameterized `SqlQuery<T>` (no string interpolation into SQL queries).
- [ ] **PII & Log Sanitization**: Passwords, tokens, credit card numbers, and API keys are never logged.
- [ ] **Rate Limiting**: High-risk endpoints (login, register, payment, forgot password) are decorated with rate limiting policies.
