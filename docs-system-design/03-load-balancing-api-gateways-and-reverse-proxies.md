# 03 - Load Balancing, API Gateways & Reverse Proxies

Load Balancers and API Gateways distribute network traffic across server instances, preventing server overload and providing centralized routing, security, and telemetry.

---

## 1. Layer 4 (L4) vs. Layer 7 (L7) Load Balancing

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ LAYER 4 (Transport Layer - TCP / UDP)                       │ LAYER 7 (Application Layer - HTTP / HTTPS / gRPC)           │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Routes packets based on IP Address and TCP Port only.     │ • Inspects HTTP Headers, Cookies, URL Paths, and Payload.   │
│ • Does NOT decrypt SSL/TLS or inspect HTTP contents.        │ • Can route `/api/users` to Service A and `/api/orders` to B│
│ • Blazing fast, low CPU consumption (e.g. AWS NLB, IPVS).   │ • Supports SSL termination, compression, and WAF inspection.│
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Load Balancing Algorithms

```
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Algorithm          │ Mechanism                        │ Best Use Case                       │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Round Robin        │ Sequentially cycles through nodes│ Homogeneous servers & equal tasks.  │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Weighted Least Conn│ Routes to server with lowest     │ Long-lived connections (WebSockets, │
│                    │ active concurrent connections.   │ heavy DB queries).                  │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ IP Hash            │ `hash(ClientIP) % N`             │ Sticky sessions (when stateful).    │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Consistent Hashing │ Maps servers & keys onto a       │ Distributed Caching (Redis/Memcached│
│                    │ circular $2^{32}-1$ hash ring.   │ Minimizes re-allocation on scale).  │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

### Consistent Hashing Ring Concept
When adding or removing a node in a regular `hash(key) % N` cluster, almost 100% of cached keys must be remapped. With **Consistent Hashing**, only $K/N$ keys move on average:

```
                          Server A (Node 1)
                               ○ [0°]
                           .       .
                       .               .
    Key X (hashes to 300°)           Key Y (hashes to 45°)
             .                           .
           .                               .
   Server C (Node 3)                   Server B (Node 2)
       ○ [240°]                            ○ [120°]
```

---

## 3. The API Gateway Pattern & BFF (Backend-for-Frontend)

An API Gateway sits between client devices and internal microservices:
- **Reverse Proxying & Routing**: Decouples external API contract from internal service topology.
- **Cross-Cutting Concerns**: Authentication (JWT validation), Global Rate Limiting, SSL Termination, Correlation ID injection (`X-Correlation-ID`).
- **BFF (Backend-For-Frontend)**: Specialized API Gateways tailored for specific client formats (e.g. Mobile BFF with compacted payloads vs. Desktop Web BFF).

---

## 4. Modern Reverse Proxies: YARP (.NET 10) & Envoy

Microsoft **YARP (Yet Another Reverse Proxy)** is a high-throughput, customizable reverse proxy built on ASP.NET Core:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();
app.MapReverseProxy();
app.Run();
```

### `appsettings.json` Configuration:
```json
{
  "ReverseProxy": {
    "Routes": {
      "product-route": {
        "ClusterId": "products-cluster",
        "Match": { "Path": "/api/products/{**catch-all}" }
      }
    },
    "Clusters": {
      "products-cluster": {
        "Destinations": {
          "dest1": { "Address": "http://10.0.0.10:5000" },
          "dest2": { "Address": "http://10.0.0.11:5000" }
        }
      }
    }
  }
}
```
