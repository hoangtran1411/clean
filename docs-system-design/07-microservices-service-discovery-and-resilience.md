# 07 - Microservices Architecture, Service Discovery & Resilience Patterns

Microservices decompose applications into independently deployable, loosely coupled services communicating over lightweight protocols (HTTP/REST, gRPC, Async Events).

---

## 1. Monolith vs. Modular Monolith vs. Microservices

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ MODULAR MONOLITH                                            │ MICROSERVICES ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Single codebase, single deployment unit.                  │ • Independent repositories, independent CI/CD pipelines.    │
│ • Clear domain boundaries enforced via projects/assemblies. │ • Independent scaling per service (e.g. scale Auth 10x).   │
│ • Zero network latency between modules (In-memory calls).   │ • Polyglot flexibility (choose best language/DB per service)│
│ • Ideal starting point for 90% of enterprise systems!       │ • Cons: Network overhead, distributed tracing, ops complexity│
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Distributed Resilience Patterns (Polly & .NET Resilience)

In distributed architectures, transient network failures and service outages are inevitable. Never make unbounded synchronous network calls without resilience wrappers:

```
                                  DISTRIBUTED RESILIENCE PIPELINE
                                  
  Request ──► [1. Timeout Policy] ──► [2. Circuit Breaker] ──► [3. Retry + Exponential Backoff & Jitter]
                                                                                  │
                                                                                  ▼
                                                                     [Remote HTTP / gRPC Call]
```

### The Circuit Breaker States:
1. **Closed (Normal)**: Requests pass through. Counts failures.
2. **Open (Tripped)**: If failure rate exceeds threshold (e.g. 50% errors in 10s), breaker opens immediately. Fails fast without overloading the downstream service.
3. **Half-Open (Testing)**: After a sleep duration (e.g. 30s), lets a trial request pass. If successful, resets to Closed; if it fails, trips back to Open.

### Polly Resilience in .NET 10:
```csharp
builder.Services.AddHttpClient("PaymentGateway")
    .AddStandardResilienceHandler(options =>
    {
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(5);
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
        options.CircuitBreaker.FailureRatio = 0.5; // Trip if 50% fail
        options.Retry.MaxRetryAttempts = 3;
        options.Retry.BackoffType = DelayBackoffType.Exponential;
        options.Retry.UseJitter = true; // Prevents retry storm synchronization
    });
```

---

## 3. Distributed Tracing with OpenTelemetry & W3C TraceContext

When a single user request spans 10 distinct microservices, distributed tracing propagates a unique **`traceparent`** HTTP header (`W3C TraceContext` standard) across all network boundaries:

```
Client ──► [API Gateway (TraceId: 4bf92f3577b34da6)]
                 │
                 ├──► [Order Service (SpanId: 00f067aa0ba902b7)]
                 │          │
                 │          └──► [Payment Service (SpanId: 5c341e9766487a22)]
                 │
                 └──► [Notification Service (SpanId: 8a3b5c7d2e1f4098)]
```
All logs, metrics, and traces across all services are unified by the single `TraceId` in Jaeger / Datadog / OpenTelemetry Collector!
