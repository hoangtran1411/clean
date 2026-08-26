# Application Security, Defense-in-Depth & Zero Trust Architecture - Learning Path

Welcome to the comprehensive **Security Helper & Engineering Curriculum** covering **Threat Modeling & Zero Trust**, **OWASP Top 10 & API Security**, **JWT & Authentication Hardening**, **RBAC / ABAC & Dynamic Authorization**, **Cryptography & Secrets Management**, **CORS, CSRF & Security Headers**, **Rate Limiting & DDoS Defense**, **Secure Coding & Input Sanitization**, **Security Auditing & Incident Response**, and **Top 30 Security Interview Questions**.

---

## 🛡️ Security Step-by-Step Learning Modules

1. [**01 - Security Fundamentals, Zero Trust & Threat Modeling**](file:///C:/Users/Hoang/Desktop/clean/docs-security/01-security-fundamentals-and-threat-modeling.md)
   - CIA Triad (Confidentiality, Integrity, Availability) & Defense in Depth
   - STRIDE Threat Modeling & DREAD Risk Assessment Methodology
   - Principle of Least Privilege (PoLP) and Attack Surface Minimization
   - Zero Trust Architecture (Never Trust, Always Verify, Assume Breach)

2. [**02 - OWASP Top 10 & API Security Best Practices**](file:///C:/Users/Hoang/Desktop/clean/docs-security/02-owasp-top-10-and-api-security-best-practices.md)
   - Deep dive into OWASP Top 10 Web & OWASP API Security Top 10
   - Broken Object Level Authorization (BOLA / IDOR) & Prevention
   - Broken Function Level Authorization (BFLA) & Mass Assignment vulnerabilities
   - Server-Side Request Forgery (SSRF) and SQL / Command Injection prevention

3. [**03 - Authentication & JWT Security Hardening**](file:///C:/Users/Hoang/Desktop/clean/docs-security/03-authentication-and-jwt-security-hardening.md)
   - Password Hashing (PBKDF2 HMAC-SHA512 vs. Argon2id vs. BCrypt)
   - JWT Vulnerabilities: Algorithm Confusion (`alg: none`), Secret Bruteforce, Token Tampering
   - Refresh Token Rotation with Automatic Reuse Detection & Family Revocation
   - Sliding Sessions, In-Memory Revocation Lists, and Absolute Expiration

4. [**04 - Authorization, RBAC, ABAC & Dynamic Permission Enforcement**](file:///C:/Users/Hoang/Desktop/clean/docs-security/04-authorization-rbac-abac-and-dynamic-permissions.md)
   - Role-Based (RBAC) vs. Attribute-Based (ABAC) vs. Policy-Based Access Control (PBAC)
   - Dynamic Custom Policy Providers (`IAuthorizationPolicyProvider`) & Requirements
   - Declarative Controller/Action Security with `[HasPermission("...")]`
   - Multi-Tenant Data Isolation and Row-Level Security filters

5. [**05 - Cryptography, Data Protection & Enterprise Secrets Management**](file:///C:/Users/Hoang/Desktop/clean/docs-security/05-cryptography-data-protection-and-secrets-management.md)
   - Symmetric (AES-256-GCM / ChaCha20) vs. Asymmetric (RSA-4096 / ECDSA)
   - ASP.NET Core Data Protection API (`IDataProtector`) & Key Persisters
   - Encryption-in-Transit (TLS 1.3, Strict-Transport-Security, Cipher Suites)
   - Secure Key Management (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault)

6. [**06 - Network Security, CORS, CSRF & Defensive HTTP Headers**](file:///C:/Users/Hoang/Desktop/clean/docs-security/06-network-security-cors-csrf-and-security-headers.md)
   - CORS Security Deep-Dive (Preflight `OPTIONS`, Origin Whitelisting, Wildcard risks)
   - Cross-Site Request Forgery (CSRF) & SameSite Cookie flags vs. Bearer Tokens
   - Essential Security Headers: CSP (Content Security Policy), HSTS, X-Content-Type-Options, Permissions-Policy
   - Clickjacking prevention with `X-Frame-Options: DENY` and `frame-ancestors 'none'`

7. [**07 - Rate Limiting, DDoS Mitigation & API Defense Strategies**](file:///C:/Users/Hoang/Desktop/clean/docs-security/07-rate-limiting-ddos-protection-and-api-defense.md)
   - ASP.NET Core Built-in Rate Limiting Algorithms (`FixedWindow`, `SlidingWindow`, `TokenBucket`, `Concurrency`)
   - Distributed Partitioned Rate Limiting by IP, API Key, and Endpoint
   - Regular Expression Denial of Service (ReDoS) prevention using Source Generators
   - Request Body Limits, HTTP Slowloris prevention, and Global Circuit Breakers

8. [**08 - Secure Coding, Input Validation & Data Sanitization**](file:///C:/Users/Hoang/Desktop/clean/docs-security/08-secure-coding-input-validation-and-data-sanitization.md)
   - Request payload validation with FluentValidation & MediatR Pipeline
   - Cross-Site Scripting (XSS) prevention: HTML sanitization, Contextual Encoding
   - Secure File Upload handling: Magic number inspection, extension whitelisting, path traversal defense
   - Preventing Excel / CSV Formula Injection (DDE injection) during EPPlus exports

9. [**09 - Security Logging, Audit Trails & Incident Response**](file:///C:/Users/Hoang/Desktop/clean/docs-security/09-security-logging-auditing-and-incident-response.md)
   - Immutable Audit Logging: Capturing User, Timestamp, IP, Correlation ID, and State Diff
   - Personally Identifiable Information (PII) & Credential Masking in Serilog
   - Security Information & Event Management (SIEM) ingestion best practices
   - Incident Response Playbook: Detection, Containment, Eradication, and Post-Mortem

10. [**10 - Top 30 Application & Web Security Interview Questions**](file:///C:/Users/Hoang/Desktop/clean/docs-security/10-top-30-application-and-web-security-interview-questions.md)
    - 30 Comprehensive security interview questions categorized into Easy, Medium, and Advanced levels with deep technical explanations and real-world code solutions.

---

## 🔒 Security Architecture Overview

```
                                    EXTERNAL CLIENT / ATTACKER
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │     WAF / Reverse Proxy / TLS     │
                              │  - DDoS Protection & Geo-Fencing  │
                              │  - TLS 1.3 Termination & HSTS     │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │      ASP.NET Core Middleware      │
                              │  - CorrelationIdMiddleware        │
                              │  - SecurityHeadersMiddleware      │
                              │  - RateLimitingMiddleware         │
                              │  - CorsMiddleware (Strict Origin) │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │   Authentication & Policy Check   │
                              │  - JwtBearerHandler (HMAC-SHA256) │
                              │  - DynamicPermissionPolicy        │
                              │  - [HasPermission("...")] Filter  │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │        MediatR Pipeline           │
                              │  - ValidationBehavior (FluentVal) │
                              │  - Logging & PerformanceBehavior  │
                              │  - Idempotency Validation Check   │
                              └─────────────────┬─────────────────┘
                                                │
                                                ▼
                              ┌───────────────────────────────────┐
                              │  Domain Logic & Database Access   │
                              │  - Parameterized Queries / EF     │
                              │  - Row-Level Tenancy Filters      │
                              │  - Audit Logs (SaveChangesInter.) │
                              └───────────────────────────────────┘
```
