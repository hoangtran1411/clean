# 08 - Distributed Data Stores & NoSQL Classification

Selecting the appropriate storage technology for each microservice depends on access patterns, read/write ratios, schema fluidity, and query complexity.

---

## 1. The 6 Major Database Paradigms

```text
┌────────────────────┬────────────────────────────┬─────────────────────────────────────┐
│ Category           │ Popular Engines            │ Primary Use Case                    │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 1. Relational      │ PostgreSQL, SQL Server,    │ ACID transactions, structured data, │
│    (RDBMS)         │ MySQL                      │ complex relational JOINs.           │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 2. Key-Value       │ Redis, AWS DynamoDB,       │ Session tokens, distributed locks,  │
│                    │ Memcached                  │ caching, shopping carts.            │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 3. Document        │ MongoDB, Couchbase         │ Fluid schemas, catalogs, nested JSON│
│                    │                            │ payloads without rigid migrations.  │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 4. Wide-Column     │ Apache Cassandra, ScyllaDB │ Massive write throughput, time-     │
│    (LSM-Tree)      │                            │ stamped sensor data, activity logs. │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 5. Graph           │ Neo4j, Amazon Neptune      │ Social networks, fraud detection,   │
│                    │                            │ recommendation knowledge graphs.    │
├────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ 6. Vector          │ Milvus, Qdrant, Pinecone,  │ AI Embeddings, semantic similarity, │
│                    │ pgvector                   │ LLM Retrieval-Augmented Gen (RAG).  │
└────────────────────┴────────────────────────────┴─────────────────────────────────────┘
```

---

## 2. Deep Dive: B-Tree (RDBMS) vs. LSM-Tree (Cassandra / RocksDB)

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ B+TREE (Read-Optimized - PostgreSQL / SQL Server)           │ LSM-TREE (Write-Optimized - Cassandra / ScyllaDB / RocksDB) │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Updates data in-place on 8KB disk pages.                  │ • Writes append sequentially to in-memory **MemTable** & WAL│
│ • Slower random disk writes due to page splits & WAL locks. │ • MemTable flushes sequentially to immutable **SSTables**.  │
│ • Blazing fast point lookups and range scans.               │ • Ultra-fast sequential disk writes; reads check Bloom      │
│                                                             │   filters and merge SSTables via background compaction.     │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 3. Polyglot Persistence Architecture

Modern systems employ **Polyglot Persistence**, assigning different data stores to the components best suited for them:

```text
                  ┌───────────────────────────────────────────────┐
                  │              E-COMMERCE SYSTEM                │
                  └───────────────────────┬───────────────────────┘
                                          │
       ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
       ▼                  ▼               ▼               ▼                  ▼
 [PostgreSQL]         [Redis]         [MongoDB]      [Cassandra]         [Qdrant]
 Orders & Payments   User Sessions   Product Catalog Clickstream Logs    AI Search
 (ACID & Money)      & Rate Limits   & Reviews       & Telemetry         Embeddings
```
