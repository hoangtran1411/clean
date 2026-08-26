# 10 - Top 30 System Design Interview Questions & Step-by-Step Framework

A comprehensive collection of 30 distributed system design interview questions split across **Easy**, **Medium**, and **Advanced** levels, accompanied by the standardized **4-Step Interview Framework**.

---

## 🎯 The 4-Step System Design Interview Framework

```
  ┌─────────────────────────────────────────────────────────────┐
  │ STEP 1: SCOPE REQUIREMENTS & CONSTRAINTS (5-8 Mins)         │
  │ • Functional Requirements (Top 3 core user features).       │
  │ • Non-Functional Requirements (Latency, High Availability,  │
  │   Consistency vs. Availability, Scale QPS, Storage 5-yr).   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │ STEP 2: HIGH-LEVEL ARCHITECTURE DESIGN (10-15 Mins)         │
  │ • Define API endpoints (REST / gRPC / WebSocket).           │
  │ • Draw end-to-end data flow (Client ➔ CDN ➔ LB ➔ Gateway    │
  │   ➔ App Services ➔ Caches ➔ Queues ➔ Databases).            │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │ STEP 3: COMPONENT DEEP DIVE (15-20 Mins)                    │
  │ • Database schema & indexing strategy (SQL vs NoSQL).       │
  │ • Sharding keys, hashing ring algorithms, cache invalidation│
  │ • Concurrency, race condition mitigation (Locks vs Lua).    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────▼──────────────────────────────┐
  │ STEP 4: BOTTLENECK ANALYSIS & TRADE-OFFS (5-7 Mins)         │
  │ • Identify Single Points of Failure (SPOF).                 │
  │ • Discuss CAP/PACELC trade-offs, auto-scaling, monitoring.  │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🟢 Easy Level (Questions 1 - 10)

### 1. What is the difference between Vertical and Horizontal Scaling?
- **Vertical Scaling (Scale-Up)** adds more CPU, RAM, or storage to a single server. It is simple but has a hard physical ceiling and introduces a single point of failure.
- **Horizontal Scaling (Scale-Out)** adds more server nodes to a distributed pool, providing near-infinite scalability and high fault tolerance.

### 2. What is the CAP theorem?
In any asynchronous distributed data store, you can guarantee at most two out of three properties: Consistency (all nodes see same data simultaneously), Availability (every request receives a non-error response), and Partition Tolerance (system continues functioning despite network drops). Because network partitions are inevitable, systems must choose between CP and AP.

### 3. What is the difference between Layer 4 and Layer 7 Load Balancing?
- **Layer 4 (Transport)** routes traffic based on IP address and TCP/UDP ports without inspecting packet payloads or terminating SSL.
- **Layer 7 (Application)** inspects HTTP headers, cookies, and URLs, allowing content-based routing, SSL termination, and rate limiting.

### 4. What is a CDN (Content Delivery Network)?
A geographically distributed network of proxy edge servers that caches static content (images, videos, HTML, JS/CSS) close to end users, reducing latency and offloading origin servers.

### 5. What is the Cache-Aside (Lazy Loading) pattern?
The application first queries the cache. On a cache hit, it returns the data. On a cache miss, it reads from the primary database, populates the cache for future requests, and returns the data.

### 6. What is Database Replication and why is it used?
Replication copies data across multiple database servers. It increases read throughput (by querying read replicas), provides high availability, and prevents data loss if the primary node crashes.

### 7. What is the difference between Synchronous and Asynchronous communication?
- **Synchronous (HTTP/gRPC)**: The client blocks and waits for the server to process the request and return a response.
- **Asynchronous (Message Queues/Kafka)**: The client sends a message and continues execution immediately without waiting for processing to complete.

### 8. What is a Reverse Proxy?
A server that sits in front of web servers and forwards client requests to those web servers. It provides security, SSL termination, caching, compression, and load distribution.

### 9. What is a Single Point of Failure (SPOF)?
A single component in an architecture whose failure will cause the entire system to fail. SPOFs are eliminated through redundancy, clustering, and automated failover.

### 10. What is the difference between Throughput and Latency?
- **Throughput**: The number of requests or volume of data processed per unit of time (e.g. 10,000 QPS).
- **Latency**: The time taken for a single request to travel from client to server and receive a response (e.g. 15ms).

---

## 🟡 Medium Level (Questions 11 - 20)

### 11. What is Consistent Hashing and why is it essential in distributed caching?
Consistent hashing maps servers and keys onto a circular $2^{32}-1$ hash ring. When a server node is added or removed, only $K/N$ keys need to be remapped on average (compared to nearly 100% with standard modulo hashing), preventing cache avalanche.

### 12. Explain the difference between Cache Avalanche, Cache Breakdown, and Cache Penetration.
- **Cache Avalanche**: Many keys expire simultaneously, flooding the database with requests (Fix: Randomize TTL jitter).
- **Cache Breakdown**: A single super-hot key expires and thousands of concurrent requests hit the DB at once (Fix: Distributed Mutex / SingleFlight).
- **Cache Penetration**: Requests query non-existent keys that are never cached (Fix: Bloom Filters or caching null objects).

### 13. What is the Transactional Outbox Pattern?
To guarantee atomicity between updating a database and publishing an event to a message broker, the event is saved to an `Outbox` table within the same local database transaction. A background process reads the outbox table and publishes events reliably to the broker.

### 14. What is the difference between RabbitMQ and Apache Kafka?
- **RabbitMQ**: A traditional message broker supporting complex routing (exchanges, topics), point-to-point queues, where messages are deleted once acknowledged.
- **Apache Kafka**: A distributed, partitioned, append-only commit log with persistent message storage, enabling high-throughput stream processing and event replay.

### 15. How does a Circuit Breaker pattern prevent cascading system failures?
A circuit breaker monitors remote calls. If failure rates exceed a threshold, it trips to **Open**, failing fast immediately without calling the failing downstream service. After a timeout, it transitions to **Half-Open** to test if the service has recovered.

### 16. What is Database Sharding and what are common sharding keys?
Database sharding horizontally partitions rows across multiple distinct databases. Common shard keys include `UserId`, `TenantId`, or geographic region, chosen to distribute read/write traffic evenly and avoid cross-shard queries.

### 17. What is the difference between Strong Consistency and Eventual Consistency?
- **Strong Consistency**: Every read returns the most recent write immediately across all nodes (higher latency, lower availability during partitions).
- **Eventual Consistency**: Replicas converge to the same state over time without immediate synchronization guarantees (ultra-low latency, high availability).

### 18. What is the PACELC theorem?
An extension of CAP: If there is a **Partition (P)**, trade off **Availability (A)** vs **Consistency (C)**; **Else (E)** in normal state, trade off **Latency (L)** vs **Consistency (C)**.

### 19. What is a Bloom Filter?
A space-efficient probabilistic data structure that tests set membership. It can return false positives ("key might exist") but never false negatives ("key definitely does not exist"), protecting databases from useless queries.

### 20. What is the Saga Pattern in distributed microservices?
A pattern for managing distributed transactions across multiple services without distributed locks (2PC). It executes a series of local transactions, triggering compensating transactions backwards if any step fails to rollback state.

---

## 🔴 Advanced Level (Questions 21 - 30)

### 21. How do you design a high-concurrency Flash Sale / Ticket Booking system without overselling?
Maintain inventory in Redis. Use an atomic **Redis Lua script** to check stock and decrement in a single atomic step. Push successful reservations to an asynchronous Kafka queue for database persistence. Reject requests when Redis stock reaches zero, shielding the SQL database from millions of concurrent writes.

### 22. Explain the difference between B+Trees and Log-Structured Merge (LSM) Trees.
- **B+Trees (RDBMS)** update pages in-place on disk, optimizing for read performance and range scans at the cost of random disk writes.
- **LSM-Trees (Cassandra/RocksDB)** write sequentially to an in-memory MemTable and append-only WAL, flushing to immutable SSTables, maximizing write throughput.

### 23. How do you prevent the "Celebrity / Hotspot" problem in distributed social networks?
For normal users, use a **Fan-out on Write** (Push model: write post directly to followers' home feeds). For celebrities with millions of followers, switch to a **Fan-out on Read** (Pull model: dynamically merge celebrity posts into the feed when the follower opens the app).

### 24. What is Leaderless Replication and what condition guarantees strong consistency?
In Dynamo-style leaderless replication, clients write to and read from multiple replicas concurrently. Strong consistency is guaranteed when the Write Quorum ($W$) and Read Quorum ($R$) exceed total replicas ($N$):
$$\mathbf{W + R > N}$$
This guarantees that the read set and write set overlap on at least one replica holding the latest version.

### 25. How do you generate globally unique 64-bit IDs in a distributed system?
Use a Twitter **Snowflake ID** algorithm:
- 1 bit unused + 41 bits Epoch Timestamp (milliseconds) + 10 bits Machine/Datacenter ID + 12 bits Sequence counter.
- Generates time-sortable, 64-bit integers without centralized database auto-increment bottlenecks.

### 26. How do you implement Distributed Locks reliably across multiple nodes?
Use **Redlock** (Redis distributed lock) or **Apache ZooKeeper / etcd** (consensus-based ephemeral nodes). Locks must have a lease timeout and a monotonically increasing **Fencing Token** to reject writes from clients experiencing long GC pauses.

### 27. What is Two-Phase Commit (2PC) and why is it considered an anti-pattern in modern microservices?
2PC uses a central coordinator to execute Prepare and Commit phases. It is synchronous and holds exclusive database locks across services for the entire duration. If the coordinator crashes or network latency occurs, database connections stall, destroying scalability.

### 28. How does Vector Search work in modern AI architectures?
High-dimensional embeddings (e.g. 1536-dimension vectors from OpenAI models) are stored in vector databases (Milvus, Qdrant, pgvector). Searches compute Cosine Similarity or Hierarchical Navigable Small World (HNSW) graphs to find semantically similar text/images in sub-millisecond time.

### 29. How do you design a resilient multi-region Active-Active architecture?
Deploy stateless application servers and database clusters across two or more cloud regions. Use GeoDNS (Route 53) with latency-based routing. Use asynchronous multi-master database replication with Conflict-Free Replicated Data Types (CRDTs) or Last-Write-Wins (LWW) resolution strategies.

### 30. How do you prevent duplicate webhook executions in distributed financial integrations?
Enforce **API Idempotency**: Require the client/webhook sender to include an `Idempotency-Key` header. Store the key in Redis/SQL with a state enum (`Processing`, `Completed`, `Failed`). If a duplicate key arrives, return the cached original response without re-executing payment processing.
