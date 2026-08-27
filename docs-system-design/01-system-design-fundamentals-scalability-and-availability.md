# 01 - System Design Fundamentals, Scalability & Availability

System design is the process of defining architecture, modules, interfaces, and data for a system to satisfy specified technical and business requirements.

---

## 1. Vertical Scaling (Scale-Up) vs. Horizontal Scaling (Scale-Out)

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ VERTICAL SCALING (Scale-Up)                                 │ HORIZONTAL SCALING (Scale-Out)                              │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Adding more CPU, RAM, or NVMe SSDs to a single server.   │ • Adding more server nodes to a distributed pool.           │
│ • Pros: Simple, no distributed coordination needed.         │ • Pros: Virtually unlimited scale, fault-tolerant.          │
│ • Cons: Hard hardware ceiling, expensive, SPOF risk.        │ • Cons: Network complexity, distributed state & consistency.│
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. High Availability (HA) & Calculating "Nines" of Uptime

Availability is measured as the percentage of time a system remains operational and accessible.

$$\text{Availability} = \frac{\text{Total Uptime}}{\text{Total Uptime} + \text{Downtime}} \times 100\%$$

| Availability SLA | Downtime per Day | Downtime per Month | Downtime per Year | Target System Profile |
| :--- | :--- | :--- | :--- | :--- |
| **99% ("2 nines")** | 14.4 minutes | 7.3 hours | 3.65 days | Internal non-critical batch tools |
| **99.9% ("3 nines")** | 1.44 minutes | 43.8 minutes | 8.77 hours | Standard commercial SaaS products |
| **99.99% ("4 nines")** | 8.64 seconds | 4.38 minutes | 52.6 minutes | Cloud infrastructure, payment systems |
| **99.999% ("5 nines")** | 0.86 seconds | 26.3 seconds | 5.26 minutes | Telecommunications, financial exchanges |

---

## 3. Eliminating Single Points of Failure (SPOF)

A Single Point of Failure is any individual component whose failure causes the entire system to stop functioning.

```text
       ❌ ARCHITECTURE WITH SPOF:
       [Clients] ──► [Single Load Balancer (SPOF!)] ──► [Single App Server (SPOF!)] ──► [Single DB (SPOF!)]

       ✅ FAULT-TOLERANT ARCHITECTURE:
                     ┌──► [Active LB]   ──► (Keepalived VRRP / Multi-AZ DNS)
       [Clients] ───►┤
                     └──► [Passive LB]
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
       [App Server 1 (AZ-1)]         [App Server 2 (AZ-2)] (Stateless)
                │                             │
                └──────────────┬──────────────┘
                               ▼
              [Primary DB (Sync Replication)] ──► [Standby Replica (Auto-Failover)]
```

---

## 4. Back-of-the-Envelope Capacity Estimations

In system design interviews, back-of-the-envelope calculations estimate storage, bandwidth, and compute requirements:

### Key Powers of Two / Ten Rules:

- 1 Day $\approx 86,400$ seconds $\approx 10^5$ seconds (use $10^5$ for easy mental math).
- $1 \text{ Million requests / day} \approx \frac{10^6}{10^5} = 10 \text{ requests / second (QPS)}$.
- $100 \text{ Million requests / day} \approx 1,000 \text{ QPS}$ (with $2,000 \text{ Peak QPS}$ at $2\times$).

### Storage Estimation Example:

- 100 Million daily active users write 1 photo post per day ($200\text{ KB}$ metadata + image link).
- Storage per day: $10^8 \times 200\text{ KB} = 20\text{ TB / day}$.
- Storage for 5 years: $20\text{ TB} \times 365 \times 5 \approx 36.5\text{ Petabytes}$.
