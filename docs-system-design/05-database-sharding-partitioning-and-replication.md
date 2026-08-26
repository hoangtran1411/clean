# 05 - Database Architecture: Sharding, Partitioning & Replication

When database storage or write throughput exceeds the limits of a single machine, we scale using replication topologies, vertical partitioning, and horizontal sharding.

---

## 1. Database Replication Topologies

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ 1. SINGLE-LEADER (Primary-Replica / Master-Slave)           │ 2. LEADERLESS (Dynamo-Style Quorum)                         │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Writes go ONLY to the Primary node.                       │ • Writes & Reads can go to ANY replica node.                │
│ • Reads distributed across multiple Read Replicas.          │ • Strict consistency guaranteed if:                         │
│ • Con: Replication lag can cause "Stale Reads".             │   $$\mathbf{W + R > N}$$                                    │
│                                                             │   ($W = \text{Write Quorum}, R = \text{Read Quorum},        │
│                                                             │    N = \text{Total Replicas}$).                             │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Horizontal Sharding vs. Vertical Partitioning

- **Vertical Partitioning**: Splitting a large table by columns (e.g. moving `UserCredentials` to DB 1 and `UserProfilePhotos` to DB 2).
- **Horizontal Sharding**: Splitting a single table by rows across multiple independent database instances.

```
                  HORIZONTAL DATABASE SHARDING ARCHITECTURE
                  
                                [Application Layer]
                                         │
                         ┌───────────────┼───────────────┐
                         │ (Shard Key:   │ (Shard Key:   │ (Shard Key:
                         │  UserId % 3=0)│  UserId % 3=1)│  UserId % 3=2)
                         ▼               ▼               ▼
                   ┌───────────┐   ┌───────────┐   ┌───────────┐
                   │  Shard 0  │   │  Shard 1  │   │  Shard 2  │
                   │ (Users 0..)│   │ (Users 1..)│   │ (Users 2..)│
                   └───────────┘   └───────────┘   └───────────┘
```

---

## 3. Sharding Strategies

```
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Strategy           │ How it Works                     │ Trade-Offs                          │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 1. Range-Based     │ Shard by ranges (e.g. User A-C   │ ❌ Creates severe Hotspots if data  │
│                    │ on Shard 1, D-F on Shard 2).     │    distribution is uneven.          │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 2. Hash-Based      │ `hash(ShardKey) % TotalShards`   │ ✅ Uniform distribution across DBs. │
│                    │                                  │ ❌ Range queries require scatter-   │
│                    │                                  │    gather across all shards.        │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ 3. Directory-Based │ Central lookup service maps keys │ ✅ Maximum flexibility to move data.│
│                    │ to specific database shards.     │ ❌ Lookup service becomes a SPOF.   │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 4. Complexities of Distributed Sharding

1. **Cross-Shard Joins**: Joining data across two distinct database servers requires expensive network round-trips and memory aggregation at the application layer. (Solution: Denormalize data or shard by common Tenant/User ID).
2. **Re-Sharding & Data Migration**: Scaling from 4 shards to 8 shards requires consistent hashing or online zero-downtime dual-writing migration pipelines.
3. **Celebrity / Hotspot Problem**: If an influential celebrity (e.g. 50M followers) is assigned to Shard 3, that single shard experiences 1000x normal load.
