# 04 - Caching Strategies, Invalidation & Distributed Caching

Caching stores copies of frequently accessed data in high-speed, volatile memory (RAM), reducing backend database load and delivering sub-millisecond response latencies.

---

## 1. Caching Access Patterns

```text
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Pattern            │ Data Flow                        │ Pros & Cons                         │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 1. Cache-Aside     │ 1. App checks cache on read.     │ ✅ Resilient (DB works if cache fails)│
│    (Lazy Loading)  │ 2. If miss, app queries DB &     │ ❌ Cache misses incur 3 network hops│
│                    │    populates cache.              │    (App ➔ Cache ➔ DB ➔ Cache).     │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 2. Write-Through   │ App writes to Cache, and Cache   │ ✅ Data in cache always up-to-date. │
│                    │ synchronously writes to DB.      │ ❌ Higher write latency (2 writes). │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 3. Write-Behind    │ App writes to Cache immediately; │ ✅ Ultra-fast write throughput.     │
│    (Write-Back)    │ Cache asynchronously batches DB  │ ❌ Risk of data loss if cache node  │
│                    │ updates in background.           │    crashes before flushing to DB!   │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. The 3 Major Caching Hazards & Mitigations

```text
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ 1. CACHE AVALANCHE (Simultaneous Expiration)                                            │
 │ • Problem: Thousands of cached keys have the exact same TTL (e.g. 1 hour). When the     │
 │   hour strikes, all keys expire simultaneously, flooding the database with requests.   │
 │ • Mitigation: Add a randomized **TTL Jitter** (`TTL = 3600s + Random(-300s, +300s)`).   │
 ├─────────────────────────────────────────────────────────────────────────────────────────┤
 │ 2. CACHE BREAKDOWN / STAMPEDE (Hot Key Expiration)                                      │
 │ • Problem: A single super-hot key (e.g. World Cup score) expires. 100,000 concurrent   │
 │   requests hit the cache miss at the exact same millisecond, overwhelming the DB.       │
 │ • Mitigation: **Distributed Mutex (SingleFlight)**: Only 1 thread queries DB; all      │
 │   other threads wait on the mutex and share the result.                                 │
 ├─────────────────────────────────────────────────────────────────────────────────────────┤
 │ 3. CACHE PENETRATION (Querying Non-Existent Keys)                                       │
 │ • Problem: Attacker queries `GET /api/user/-9999`. DB returns null, so nothing is cached│
 │   Every subsequent malicious request hits the database directly.                        │
 │ • Mitigation: (1) Cache Null Objects with short TTL (60s), or (2) **Bloom Filter**.     │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bloom Filter Concept

A space-efficient probabilistic data structure that can test whether an element is a member of a set:

- If Bloom Filter says **"No"**: The key definitely does NOT exist in the database (reject request immediately, 0 DB queries!).
- If Bloom Filter says **"Yes"**: The key *probably* exists (query cache/DB).

---

## 3. Multi-Tier Caching Architecture (L1 + L2)

In high-throughput .NET 10 microservices, combine fast in-process L1 cache with shared L2 Redis:

```text
    Request ──► [L1: In-Process IMemoryCache (RAM ~ 50ns)]
                      │
                      ├──► [Hit] Return immediately (0 Network calls!)
                      │
                      ▼ [Miss]
                [L2: Distributed Redis Cluster (~ 1-2ms)]
                      │
                      ├──► [Hit] Populate L1 & Return
                      │
                      ▼ [Miss]
                [Primary Database (SQL / NoSQL ~ 10-50ms)] ──► Populate L2 + L1
```
