# 09 - Security Logging, Audit Trails & Incident Response

Security logging and audit trails provide visibility into authentication attempts, permission modifications, financial transactions, and malicious probing, enabling forensic analysis and regulatory compliance (SOC 2, GDPR, ISO 27001).

---

## 1. What to Log vs. What NEVER to Log

```text
┌─────────────────────────────────────────────────────────────┐
│ ✅ ALWAYS LOG (Security Relevant Events)                    │
├─────────────────────────────────────────────────────────────┤
│ • Authentication success / failure (with username & IP)     │
│ • Authorization failures (403 Forbidden, permission denied) │
│ • Account lockouts, password resets, role modifications     │
│ • State-changing financial / administrative commands        │
│ • Correlation IDs (`X-Correlation-ID`) across all logs      │
├─────────────────────────────────────────────────────────────┤
│ ❌ NEVER LOG (Sensitive Data & Compliance Violations)       │
├─────────────────────────────────────────────────────────────┤
│ • Plain-text passwords, PINs, or recovery codes             │
│ • Full JWT Access Tokens or Refresh Tokens                  │
│ • Credit card numbers (PAN), CVVs, or bank account numbers  │
│ • Personally Identifiable Information (PII) without masking │
│ • Encryption keys, private certificates, or DB credentials  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Implementing Entity Audit Trails via `SaveChangesInterceptor`

In Clean Architecture, entity mutation logs can be recorded automatically before saving to EF Core without polluting business handlers.

```csharp
public class AuditLogEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? UserId { get; set; }
    public string EntityName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Added, Modified, Deleted
    public string? PrimaryKey { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string? CorrelationId { get; set; }
}

public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        RecordAuditEntries(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        RecordAuditEntries(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void RecordAuditEntries(DbContext? context)
    {
        if (context is null) return;

        var entries = context.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLogEntry && 
                       (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted))
            .ToList();

        foreach (var entry in entries)
        {
            var audit = new AuditLogEntry
            {
                UserId = _currentUserService.UserId,
                EntityName = entry.Entity.GetType().Name,
                Action = entry.State.ToString(),
                CorrelationId = _currentUserService.CorrelationId,
                TimestampUtc = DateTime.UtcNow
            };

            // Capture old and new values for auditing (masking sensitive fields)
            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                if (property.Metadata.IsShadowProperty()) continue;
                if (property.Metadata.Name.Contains("Password", StringComparison.OrdinalIgnoreCase)) continue;

                var propName = property.Metadata.Name;
                if (entry.State == EntityState.Modified || entry.State == EntityState.Deleted)
                {
                    oldValues[propName] = property.OriginalValue;
                }
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    newValues[propName] = property.CurrentValue;
                }
            }

            audit.OldValuesJson = JsonSerializer.Serialize(oldValues);
            audit.NewValuesJson = JsonSerializer.Serialize(newValues);

            context.Set<AuditLogEntry>().Add(audit);
        }
    }
}
```

---

## 3. Incident Response Lifecycle (NIST Framework)

When a security incident is detected, follow the standardized 4-step lifecycle:

```text
        ┌─────────────────────────────────────────────────────────────┐
        │                 1. PREPARATION                              │
        │  • SIEM configured (Elastic / Datadog / Sentinel)           │
        │  • Incident communication channels & runbooks established   │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                 2. DETECTION & ANALYSIS                     │
        │  • Alert on repeated 401/403 spikes or token reuse          │
        │  • Trace Correlation ID and client IP in logs               │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                 3. CONTAINMENT & ERADICATION                │
        │  • Invalidate affected user token families in DB            │
        │  • Block offending IP subnets at WAF / Cloudflare           │
        │  • Rotate compromised API keys / Database credentials       │
        └──────────────────────────────┬──────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        │                 4. POST-INCIDENT RECOVERY                   │
        │  • Conduct blameless root cause analysis (RCA)              │
        │  • Patch vulnerability & add automated regression test      │
        └─────────────────────────────────────────────────────────────┘
```
