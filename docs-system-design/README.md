# Large-Scale System Design & Distributed Architecture - Learning Path

Welcome to the comprehensive **System Design & Distributed Systems Curriculum** covering **Scalability & High Availability Fundamentals**, **CAP & PACELC Theorems & Consistency Models**, **Load Balancing & API Gateways (L4 vs L7 & Consistent Hashing)**, **Distributed Caching & Invalidation Strategies**, **Database Sharding, Partitioning & Replication**, **Event-Driven Architecture & Message Queues (Kafka vs. RabbitMQ)**, **Microservices Resilience Patterns (Circuit Breakers & Sagas)**, **NoSQL & Specialized Storage (Key-Value, Document, Wide-Column, Vector)**, **Real-World Case Studies (TinyURL, Flash Sale, Chat Systems)**, and **Top 30 System Design Interview Questions**.

---

## 🏛️ System Design Step-by-Step Learning Modules

1. [**01 - System Design Fundamentals, Scalability & Availability**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/01-system-design-fundamentals-scalability-and-availability.md)
   - Vertical Scaling (Scale-Up) vs. Horizontal Scaling (Scale-Out)
   - High Availability (HA), SLAs, and Calculating "Nines" of Uptime ($99.9\%$ vs. $99.999\%$)
   - Fault Tolerance, Redundancy & Eliminating Single Points of Failure (SPOF)
   - Latency vs. Throughput, Back-of-the-Envelope Capacity Estimations

2. [**02 - Distributed System Theorems: CAP, PACELC & Consistency Models**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/02-cap-pacelc-theorems-and-consistency-models.md)
   - The CAP Theorem: Consistency, Availability, Partition Tolerance (Why P is non-negotiable)
   - The PACELC Theorem: Latency vs. Consistency in normal state
   - Consistency Spectrum: Strong / Linearizable, Sequential, Causal, Read-Your-Writes, Eventual Consistency
   - Distributed Transactions: Two-Phase Commit (2PC) vs. Saga Pattern (Orchestration vs. Choreography)

3. [**03 - Load Balancing, API Gateways & Reverse Proxies**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/03-load-balancing-api-gateways-and-reverse-proxies.md)
   - Layer 4 (Transport TCP/UDP) vs. Layer 7 (Application HTTP/gRPC) Load Balancing
   - Balancing Algorithms: Round Robin, Weighted Least Connections, IP Hash, Consistent Hashing
   - API Gateway Patterns: Reverse Proxy, SSL Termination, Rate Limiting, BFF (Backend-for-Frontend)
   - Modern Gateways & Proxies: Nginx, Envoy, Traefik, and Microsoft YARP (.NET 10)

4. [**04 - Caching Strategies, Invalidation & Distributed Caching**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/04-caching-strategies-invalidation-and-distributed-caching.md)
   - Caching Access Patterns: Cache-Aside (Lazy Loading), Write-Through, Write-Behind (Write-Back), Refresh-Ahead
   - Cache Eviction Algorithms: LRU (Least Recently Used), LFU, FIFO, ARC
   - The 3 Critical Cache Hazards & Mitigations:
     - Cache Avalanche (Jittered TTLs)
     - Cache Breakdown / Stampede (Distributed Locks / SingleFlight pattern)
     - Cache Penetration (Bloom Filters & Null-Object caching)
   - Multi-Tier Caching: L1 In-Memory (`IMemoryCache`) + L2 Distributed (`Redis Cluster`)

5. [**05 - Database Architecture: Sharding, Partitioning & Replication**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/05-database-sharding-partitioning-and-replication.md)
   - Replication Topologies: Single-Leader (Master-Slave), Multi-Leader, Leaderless (Quorum $W + R > N$)
   - Vertical Partitioning vs. Horizontal Sharding
   - Sharding Routing Strategies: Range-based, Hash-based, Directory-based, Consistent Hashing
   - Complexities: Re-sharding, Cross-shard Joins, Distributed Transactions, Hotspot Mitigations

6. [**06 - Asynchronous Messaging, Event-Driven Architecture & Message Queues**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/06-event-driven-architecture-and-message-queues.md)
   - Point-to-Point Message Queues (RabbitMQ, SQS) vs. Distributed Event Streams (Apache Kafka, Kinesis)
   - Delivery Guarantees: At-Most-Once, At-Least-Once, Exactly-Once (Idempotent Consumers)
   - The Transactional Outbox Pattern & Change Data Capture (CDC / Debezium)
   - Dead-Letter Queues (DLQ), Poison Message Handling, and Consumer Backpressure

7. [**07 - Microservices Architecture, Service Discovery & Resilience Patterns**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/07-microservices-service-discovery-and-resilience.md)
   - Monolith vs. Microservices vs. Modular Monolith Trade-offs
   - Service Discovery & Health Checking (Client-side vs. Server-side Discovery)
   - Distributed Resilience Patterns: Circuit Breaker, Exponential Backoff + Jitter, Bulkhead Isolation, Fallbacks
   - Distributed Tracing & Observability (OpenTelemetry, W3C TraceContext, Jaeger, Prometheus)

8. [**08 - Distributed Data Stores & NoSQL Classification**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/08-distributed-data-stores-and-nosql-classification.md)
   - Key-Value Stores (Redis, DynamoDB, Memcached)
   - Document Stores (MongoDB, Couchbase)
   - Wide-Column Stores & Log-Structured Merge (LSM) Trees (Cassandra, ScyllaDB)
   - Graph Databases (Neo4j, AWS Neptune) & Time-Series DBs (TimescaleDB, InfluxDB)
   - Vector Databases for AI / Embeddings / Semantic Search (Milvus, Qdrant, pgvector)

9. [**09 - Real-World System Design Case Studies**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/09-real-world-system-design-case-studies.md)
   - Designing a Global URL Shortener (TinyURL / Bitly) - Base62 encoding, hash collisions, 100:1 read/write ratio
   - Designing a High-Throughput Distributed Rate Limiter (Token Bucket & Redis Sliding Log)
   - Designing an E-Commerce Flash Sale & Ticket Reservation System (Inventory locking, Redis + Lua, Queues)
   - Designing a Real-Time Chat & Notification Engine (WebSockets, Redis Pub/Sub, Kafka)

10. [**10 - Top 30 System Design Interview Questions & Step-by-Step Framework**](file:///C:/Users/Hoang/Desktop/clean/docs-system-design/10-top-30-system-design-interview-questions.md)
    - The 4-Step System Design Interview Framework (Requirements Scope ➔ High-Level Architecture ➔ Component Deep Dive ➔ Bottlenecks & Scale)
    - 30 In-depth system design interview questions across Easy, Medium, and Advanced levels with architectural diagrams and mathematical estimations.

---

## 🏗️ Large-Scale Distributed System Architecture

```text
                                    GLOBAL CLIENTS (Web / Mobile / IoT)
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │            Route 53 / GeoDNS            │
                              └────────────────────┬────────────────────┘
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │     Cloudflare / CloudFront (CDN)       │
                              │  - Static Assets, Edge Caching, WAF     │
                              └────────────────────┬────────────────────┘
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │     L4 / L7 Load Balancer (ALB / Nginx) │
                              └────────────────────┬────────────────────┘
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │       API Gateway / YARP / Envoy        │
                              │  - AuthN/AuthZ, Rate Limiting, Routing  │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                                      ▼                         ▼
                        ┌──────────────────────────┐ ┌──────────────────────────┐
                        │   Service A (Stateless)  │ │   Service B (Stateless)  │
                        │  - .NET 10 Web API Core  │ │  - .NET 10 Web API Core  │
                        └─────────────┬────────────┘ └────────────┬─────────────┘
                                      │                           │
                   ┌──────────────────┼───────────────────────────┼──────────────────┐
                   ▼                  ▼                           ▼                  ▼
      ┌──────────────────────┐ ┌───────────────┐        ┌───────────────────┐ ┌──────────────┐
      │  L1/L2 Redis Cache   │ │ Apache Kafka  │        │ Primary SQL DB    │ │ Read Replicas│
      │  - Distributed State │ │ - Event Stream│        │ (Writes Only)     │ │ (Scale Reads)│
      └──────────────────────┘ └───────┬───────┘        └─────────┬─────────┘ └──────────────┘
                                       │                          │ (CDC / Debezium)
                                       ▼                          ▼
                        ┌──────────────────────────┐    ┌────────────────────────────────────┐
                        │ Async Worker / Consumer  │    │ Elasticsearch / Vector Database    │
                        │ - Email, Billing, Webhook│    │ - Full-Text & AI Semantic Search   │
                        └──────────────────────────┘    └────────────────────────────────────┘
```
