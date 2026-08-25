# Database Engineering, SQL, EF Core 10 & Distributed Data Architecture - Learning Path

Welcome to the comprehensive database curriculum covering **Relational Modeling**, **Advanced SQL**, **Indexing & Query Optimization**, **ACID & Transactions**, **Entity Framework Core 10 Deep-Dive**, **Zero-Downtime Migrations**, **Redis Distributed Caching**, **High Availability & Sharding**, **Execution Plan Deep Dive**, **Deadlock Analysis & Resolution**, and **Database Interview Preparation**.

---

## 📚 Database Step-by-Step Learning Modules

1. [**01 - Database Fundamentals & Relational Data Modeling**](file:///C:/Users/Hoang/Desktop/clean/docs-database/01-database-fundamentals-and-relational-modeling.md)
   - RDBMS Storage Engine, Buffer Pool, and Write-Ahead Logging (WAL)
   - Primary Key strategies (INT Identity vs. GUID vs. Sequential UUIDv7 / ULID)
   - Normalization (1NF ➔ 3NF) vs. Practical Denormalization in OLTP

2. [**02 - SQL Mastery & Advanced Querying**](file:///C:/Users/Hoang/Desktop/clean/docs-database/02-sql-mastery-and-advanced-querying.md)
   - Set-based thinking & The 6 types of SQL JOINs
   - Window Functions (`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()`, `LEAD()`)
   - Common Table Expressions (CTEs) & Recursive Tree Traversal
   - Query performance: `IN` vs. `EXISTS` vs. `JOIN`

3. [**03 - Indexing Strategies & Query Optimization**](file:///C:/Users/Hoang/Desktop/clean/docs-database/03-indexing-strategies-and-query-optimization.md)
   - B+Tree internals, leaf pages, and balanced search trees
   - Clustered vs. Non-Clustered Indexes
   - Composite indexes & The Leftmost Prefix Rule
   - Covering Indexes with `INCLUDE` (eliminating Key Lookups)
   - Filtered/Partial Indexes & Query Sargability

4. [**04 - Transactions, ACID Properties & Isolation Levels**](file:///C:/Users/Hoang/Desktop/clean/docs-database/04-transactions-acid-and-isolation-levels.md)
   - ACID guarantees (Atomicity, Consistency, Isolation, Durability)
   - The 4 Concurrency Anomalies (Dirty Reads, Non-Repeatable Reads, Phantom Reads, Serialization)
   - SQL Isolation Levels (`READ UNCOMMITTED` to `SERIALIZABLE` & `SNAPSHOT`/MVCC)
   - Shared (S) vs. Exclusive (X) Locks & Deadlock prevention
   - Optimistic Concurrency (`RowVersion` in EF Core) vs. Pessimistic Concurrency (`UPDLOCK`)

5. [**05 - Entity Framework Core 10 Deep-Dive & Best Practices**](file:///C:/Users/Hoang/Desktop/clean/docs-database/05-ef-core-10-deep-dive-and-best-practices.md)
   - Change Tracker internals and snapshot diffing
   - Read performance with `AsNoTracking()` and `AsNoTrackingWithIdentityResolution()`
   - Resolving the N+1 problem with Eager Loading, Split Queries (`AsSplitQuery()`), and DTO Projections
   - Global Query Filters (Soft-Delete & Multi-Tenancy)
   - Value Objects & Owned Entities in EF Core 10

6. [**06 - Advanced EF Core Patterns & High-Performance Data Access**](file:///C:/Users/Hoang/Desktop/clean/docs-database/06-advanced-ef-core-patterns-and-performance.md)
   - Bulk Operations: `ExecuteUpdateAsync()` & `ExecuteDeleteAsync()`
   - Raw SQL & Unmapped DTOs with `SqlQuery<T>`
   - Automatic Entity Auditing via `SaveChangesInterceptor`
   - High-throughput API performance with `DbContext Pooling`
   - Temporal Tables (System-Versioned Audit Logs)

7. [**07 - Database Migrations, Versioning & Zero-Downtime CI/CD**](file:///C:/Users/Hoang/Desktop/clean/docs-database/07-database-migrations-versioning-and-cicd.md)
   - EF Core Migrations architecture & `__EFMigrationsHistory`
   - Generating Idempotent SQL migration scripts for CI/CD pipelines
   - Zero-Downtime deployments with the **Expand and Contract Pattern**
   - Safe migration rules for enterprise production databases

8. [**08 - NoSQL Databases & Distributed Caching with Redis**](file:///C:/Users/Hoang/Desktop/clean/docs-database/08-nosql-and-caching-redis-and-document-dbs.md)
   - When to choose SQL vs. NoSQL (CAP Theorem & Trade-offs)
   - Redis Architecture & Core Data Structures (Strings, Hashes, Lists, Sets, Sorted Sets)
   - The 4 Caching Patterns (Cache-Aside, Write-Through, Write-Behind, Refresh-Ahead)
   - Mitigating Cache Stampede, Cache Penetration, and Cache Breakdown

9. [**09 - Database Scaling, High Availability & Sharding**](file:///C:/Users/Hoang/Desktop/clean/docs-database/09-database-scaling-high-availability-and-sharding.md)
   - Scale-Up vs. Scale-Out (Read Replicas & CQRS DB separation)
   - Connection Pooling & preventing pool starvation
   - Sharding strategies (Hash-based, Range-based, Directory-based)
   - High Availability, RTO vs. RPO, and Point-in-Time Recovery (PITR)

10. [**10 - Top 30 Database, SQL & EF Core Interview Questions (Easy, Medium, Advanced)**](file:///C:/Users/Hoang/Desktop/clean/docs-database/10-top-30-database-and-sql-interview-questions.md)
    - 10 Foundational / Easy Questions (Primary vs Unique keys, Delete vs Truncate, Where vs Having, NULLs)
    - 10 Intermediate / Mid-Level Questions (B+Trees, Clustered vs Non-Clustered, Isolation levels, CTEs, Window functions, N+1 queries, Optimistic locking)
    - 10 Advanced / Senior Questions (Page splits, MVCC, Deadlock resolution, Zero-downtime migrations, Cache stampede, Sharding, Replication lag)

11. [**11 - Understanding Database Execution Plans (Deep Dive)**](file:///C:/Users/Hoang/Desktop/clean/docs-database/11-understanding-execution-plans-deep-dive.md)
    - Estimated vs. Actual Plans & The Cost-Based Optimizer (CBO)
    - Golden Rule of reading plans (Right-to-Left, Top-to-Bottom)
    - Physical operators: Index Seek vs. Scan, Key Lookups, Nested Loops vs. Hash Match vs. Merge Join
    - Identifying Cardinality Estimation errors, Stale Statistics, and Parameter Sniffing traps
    - Case study: 850x performance boost by eliminating Key Lookups & Sorts with a Covering Index

12. [**12 - Database Deadlocks: Identification, Analysis & Resolution (Deep Dive)**](file:///C:/Users/Hoang/Desktop/clean/docs-database/12-deadlocks-identification-and-resolution-deep-dive.md)
    - What is a Deadlock & The 4 Coffman conditions
    - How the Deadlock Monitor thread detects circular wait chains and selects victims
    - The 4 Classic Deadlock Scenarios (Reverse-Order, Lock Conversion, Bookmark Lookup, Lock Escalation)
    - Capturing & reading XML Deadlock Graphs with Extended Events & Trace Flag 1222
    - The 6 Proven Strategies: Chronological Ordering, `UPDLOCK`, RCSI/MVCC, Short Transactions, Covering Indexes, and EF Core Polly Retries (`1205`)
