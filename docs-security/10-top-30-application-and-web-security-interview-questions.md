# 10 - Top 30 Application & Web Security Interview Questions

A comprehensive collection of 30 essential software security interview questions split across **Easy**, **Medium**, and **Advanced** levels, complete with technical explanations and architecture examples.

---

## 🟢 Easy Level (Questions 1 - 10)

### 1. What is the difference between Authentication and Authorization?

- **Authentication (AuthN)**: Validates identity ("Who are you?"). Examples: Username/password verification, multi-factor authentication (MFA), biometric scans, JWT bearer token verification.
- **Authorization (AuthZ)**: Validates permissions ("What are you allowed to do?"). Examples: Role-Based Access Control (Admin vs. User), dynamic permission claims (`[HasPermission("Permissions.Products.Delete")]`), ACLs.

### 2. What is the CIA Triad?

- **Confidentiality**: Ensuring data is accessible only to authorized entities (Encryption, Least Privilege).
- **Integrity**: Ensuring data has not been altered or tampered with (HMAC signatures, SHA-512 hashes).
- **Availability**: Ensuring authorized users have uninterrupted access (Rate limiting, load balancing, high availability).

### 3. What is SQL Injection (SQLi) and how is it prevented in EF Core?

SQL Injection occurs when untrusted user input is directly concatenated into SQL query strings. In EF Core, LINQ queries and `FromSqlInterpolated()` generate parameterized SQL queries (`@p0`, `@p1`), separating SQL command structure from user data and completely eliminating SQLi.

### 4. What is Cross-Site Scripting (XSS)?

XSS occurs when malicious JavaScript is injected into trusted web applications and executed in a victim's browser. It is mitigated by contextual output encoding, strict Content Security Policies (CSP), avoiding `dangerouslySetInnerHTML`, and HTML sanitization libraries.

### 5. Why should you never use MD5 or SHA-1 for password hashing?

MD5 and SHA-1 are fast general-purpose cryptographic hash functions with known collision vulnerabilities. Attackers can execute billions of hashes per second using GPUs and rainbow tables. Password hashing requires slow, memory-hard key derivation functions like PBKDF2, BCrypt, or Argon2id.

### 6. What is the purpose of a Salt in password hashing?

A salt is a unique, cryptographically random byte sequence generated for each user and concatenated with their password before hashing. It prevents attackers from using precomputed rainbow tables to reverse passwords and ensures that two users with the same password have completely different hashes.

### 7. What is CORS and is it a server-side or client-side security mechanism?

CORS (Cross-Origin Resource Sharing) is enforced by the **web browser**, not the server. It restricts web applications running on one origin from making read requests to a different origin unless the server explicitly sends `Access-Control-Allow-Origin` headers.

### 8. What is the difference between Symmetric and Asymmetric encryption?

- **Symmetric**: Uses the same single key for both encryption and decryption (e.g. AES-256-GCM). It is computationally fast and ideal for large data payloads.
- **Asymmetric**: Uses a mathematically linked key pair: a Public Key (for encryption/signature verification) and a Private Key (for decryption/signing, e.g. RSA-4096, ECDSA).

### 9. What is the `HttpOnly` cookie flag?

The `HttpOnly` flag prevents client-side scripts (JavaScript `document.cookie`) from accessing the cookie. This protects session and refresh tokens from being stolen via Cross-Site Scripting (XSS) attacks.

### 10. What does the `X-Content-Type-Options: nosniff` header do?

It prevents web browsers from MIME-sniffing a response away from the declared `Content-Type` header (e.g., executing a file declared as `text/plain` as executable JavaScript).

---

## 🟡 Medium Level (Questions 11 - 20)

### 11. What is Broken Object Level Authorization (BOLA / IDOR)?

BOLA (Insecure Direct Object Reference) occurs when an endpoint accepts a resource ID (e.g. `GET /api/orders/9876`) and returns the object without verifying that the authenticated user owns or has rights to that specific record. Mitigation involves scoping queries to `CurrentUser.UserId` or evaluating resource-based authorization policies.

### 12. How does Refresh Token Rotation prevent token theft?

Every time a refresh token is used to obtain a new access token, the current refresh token is revoked and a new one is issued. If an attacker replays a previously used (revoked) token, the server detects token family reuse and immediately invalidates all active sessions for that user.

### 13. What is the difference between RBAC and ABAC?

- **RBAC (Role-Based Access Control)**: Assigns permissions to coarse roles (e.g. "Admin", "Auditor"). Difficult to scale when permissions depend on dynamic context.
- **ABAC (Attribute-Based Access Control)**: Grants access based on attributes of the user, resource, action, and environment (e.g., "Allow edit if `User.Department == Resource.Department` and `Time < 5 PM`").

### 14. What is a Server-Side Request Forgery (SSRF) attack?

SSRF occurs when an attacker induces a backend server to make HTTP requests to an arbitrary destination, such as internal loopback services (`http://localhost:6379`), private VPC subnets (`10.0.0.0/8`), or cloud metadata endpoints (`http://169.254.169.254`). Mitigation requires strict URL scheme and IP address whitelist verification.

### 15. What is Clickjacking and how is it mitigated?

Clickjacking tricks a user into clicking transparent iframe elements layered over legitimate UI buttons. It is prevented by returning the `X-Frame-Options: DENY` header and CSP `frame-ancestors 'none'`.

### 16. What is Mass Assignment / Over-Posting vulnerability?

When an API directly binds incoming JSON request payloads to internal database entities, attackers can send extra JSON fields (e.g., `"isAdmin": true`, `"balance": 99999`) to alter protected state. It is prevented by using strict CQRS Command DTOs and explicit mapping.

### 17. How does ASP.NET Core Rate Limiting protect against Brute Force attacks?

By attaching a `SlidingWindowLimiter` or `TokenBucketLimiter` to endpoints (e.g., `/api/auth/login`), the server enforces a maximum number of requests within a time window (e.g., 5 attempts per minute per IP), rejecting excessive requests with HTTP 429 Too Many Requests.

### 18. What is ReDoS (Regular Expression Denial of Service)?

ReDoS occurs when a poorly constructed regular expression containing nested quantifiers (e.g., `(a+)+$`) is evaluated against malicious input, causing exponential backtracking that freezes CPU cores. Mitigation in .NET involves using `[GeneratedRegex]` with explicit evaluation timeouts (`matchTimeoutMilliseconds: 250`).

### 19. What is Formula Injection (CSV / Excel Injection)?

When exporting unvalidated user data to `.csv` or `.xlsx` files, input starting with `=`, `+`, `-`, or `@` is executed as a dynamic formula or macro by Excel when opened. It is prevented by prefixing dangerous characters with an apostrophe (`'`).

### 20. What is the purpose of HSTS (HTTP Strict Transport Security)?

HSTS is an HTTP header (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`) instructing browsers to interact with the domain exclusively over HTTPS, preventing SSL-stripping and man-in-the-middle downgrade attacks.

---

## 🔴 Advanced Level (Questions 21 - 30)

### 21. Explain the JWT Algorithm Confusion Attack and its defense.

An attacker modifies a JWT header from `RS256` (asymmetric RSA) to `HS256` (symmetric HMAC) and signs the token using the server's public key (which is publicly known). If the backend uses the public key for HMAC verification, the forged token succeeds. Defense requires specifying explicit expected algorithms and validating issuer keys strictly in `TokenValidationParameters`.

### 22. What is Zero Trust Architecture and what are its three guiding principles?

Zero Trust eliminates implicit trust inside the perimeter network. Its core principles are:

1. **Verify Explicitly**: Continuously authenticate and authorize using identity, location, and device signals.
2. **Least Privilege Access**: Minimize attack blast radius with JIT/JEA policies and dynamic claims.
3. **Assume Breach**: Segment networks, encrypt end-to-end (mTLS), and log all transactions immutably.

### 23. What is AEAD (Authenticated Encryption with Associated Data) and why is AES-GCM preferred over AES-CBC?

AES-CBC only provides encryption (confidentiality) and is susceptible to Padding Oracle attacks unless combined with a separate HMAC. AES-GCM is an AEAD mode that computes an authentication tag simultaneously during encryption, guaranteeing both confidentiality and tamper-proof cryptographic integrity.

### 24. How do you implement zero-downtime secret rotation for JWT signing keys?

Configure the server with both an **Active Signing Key** (used for generating new tokens) and a list of **Previous Validation Keys** (used solely for verifying existing, unexpired tokens). Once all tokens signed by the old key expire (e.g. after 30 minutes), retire the old key completely.

### 25. How do you protect against Timing Attacks in string / hash comparisons?

Standard string comparisons (`==` or `string.Equals`) return immediately upon encountering the first mismatched character, allowing attackers to deduce secret tokens character-by-character via microsecond timing measurements. In .NET, use `CryptographicOperations.FixedTimeEquals(byteSpanA, byteSpanB)`, which executes in constant time regardless of mismatches.

### 26. How do you secure Multi-Tenant SaaS data in EF Core?

Implement EF Core **Global Query Filters** (`modelBuilder.Entity<T>().HasQueryFilter(e => e.TenantId == _currentTenantId)`) combined with an active tenant resolver middleware. This guarantees that all LINQ queries automatically append tenant scoping without relying on manual developer discipline.

### 27. What is DDE (Dynamic Data Exchange) and how does it relate to Excel reporting vulnerabilities?

DDE is a Windows protocol allowing applications to exchange data. In Excel, a cell containing `=CMD|' /C powershell.exe ...'!A0` can launch arbitrary system commands upon file opening. Mitigation requires sanitizing all text cells in EPPlus exports by escaping formula starter characters.

### 28. How does `IAuthorizationPolicyProvider` work in ASP.NET Core?

ASP.NET Core resolves policies through `IAuthorizationPolicyProvider`. By creating a custom provider subclassing `DefaultAuthorizationPolicyProvider`, the application intercepts missing policy names (e.g., `Permissions.Products.Delete`), builds a dynamic `AuthorizationPolicy` with custom requirements on the fly, and caches it, eliminating static registrations in `Program.cs`.

### 29. What is Subresource Integrity (SRI)?

SRI is a security feature that enables browsers to verify that resources fetched from CDNs (e.g., `<script src="https://cdn.example.com/lib.js" integrity="sha384-..." crossorigin="anonymous">`) have not been maliciously modified or compromised at the CDN level.

### 30. How do you design an immutable audit logging pipeline resilient to administrator tampering?

Write audit logs to an append-only write-once-read-many (WORM) storage (such as AWS S3 Object Lock or Azure Immutable Blob Storage) with cryptographic hash chaining (each log entry contains the SHA-256 hash of the preceding entry). Forward logs in real-time to a centralized, access-restricted SIEM (e.g. Datadog / Splunk) with automated tamper alerts.
