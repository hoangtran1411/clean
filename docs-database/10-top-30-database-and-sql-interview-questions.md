# 10 - Top 30 Database, SQL & EF Core Interview Questions (Easy, Medium, Advanced)

A comprehensive collection of the **Top 30 Interview Questions** asked by top tech companies for **SQL, PostgreSQL, SQL Server, Entity Framework Core 10, Indexing, and Distributed Data Engineering**.

---

## 🟢 Section 1: Foundational / Easy Questions (1 – 10)

### 1. What is the difference between `DELETE`, `TRUNCATE`, and `DROP`?

- **Answer**:
  - **`DELETE`**: DML statement. Deletes specified rows (`WHERE` clause allowed), logs each row deletion in the transaction log, and fires triggers. Can be rolled back.
  - **`TRUNCATE`**: DDL statement. Deallocates all data pages in the table, resets Identity counters, does not fire row triggers, and is much faster than `DELETE`.
  - **`DROP`**: DDL statement. Completely removes the table definition, data, indexes, constraints, and triggers from the database.
- **Interviewer looks for**: Transaction logging differences and trigger firing behavior.

---

### 2. What is the difference between a Primary Key and a Unique Key?

- **Answer**:
  - **Primary Key**: Uniquely identifies each row, creates a Clustered Index by default, and **strictly prohibits `NULL` values**. A table can have only **1** Primary Key.
  - **Unique Key**: Enforces uniqueness across non-primary columns, creates a Non-Clustered Index by default, and **allows `NULL` values** (SQL Server allows 1 NULL; PostgreSQL/Oracle allow multiple NULLs). A table can have **multiple** Unique Keys.
- **Interviewer looks for**: NULL handling and clustered vs non-clustered index defaults.

---

### 3. What is the difference between `WHERE` and `HAVING` in SQL?

- **Answer**: `WHERE` filters rows **before** grouping and aggregations are applied (cannot use aggregate functions like `SUM` or `COUNT`). `HAVING` filters aggregated groups **after** the `GROUP BY` clause has been executed.

```sql
SELECT DepartmentId, AVG(Salary) AS AvgSalary
FROM Employees
WHERE Status = 'Active' -- Evaluated before grouping
GROUP BY DepartmentId
HAVING AVG(Salary) > 75000; -- Evaluated after grouping
```

- **Interviewer looks for**: Query execution phase understanding.

---

### 4. What is the difference between `UNION` and `UNION ALL`?

- **Answer**: `UNION` combines result sets from two queries and performs an **in-memory distinct sort to remove duplicate rows**. `UNION ALL` simply concatenates both result sets together **without checking for duplicates**. `UNION ALL` is significantly faster because it avoids sorting overhead.
- **Interviewer looks for**: Performance awareness and sorting cost.

---

### 5. What are the ACID properties in database transactions?

- **Answer**:
  - **A (Atomicity)**: All operations succeed, or all roll back ("All or nothing").
  - **C (Consistency)**: Data must satisfy all schema rules, FKs, and constraints.
  - **I (Isolation)**: Concurrent transactions execute without exposing intermediate uncommitted states.
  - **D (Durability)**: Committed changes survive power failures via the Write-Ahead Log (WAL).
- **Interviewer looks for**: Clear definitions with transaction log / WAL context.

---

### 6. What is the difference between `INNER JOIN` and `LEFT JOIN`?

- **Answer**: `INNER JOIN` returns only rows where a match exists in **both** tables. `LEFT JOIN` returns **all rows from the left table**, populated with columns from the right table if a match exists, or `NULL` values if no match is found.
- **Interviewer looks for**: Understanding of NULL output in non-matching right table rows.

---

### 7. How does `NULL` evaluate in SQL comparisons?

- **Answer**: In three-valued logic (3VL), `NULL` represents an "unknown" value. Expressions like `NULL = NULL`, `NULL != NULL`, or `column = NULL` always evaluate to **`UNKNOWN` (False)**. To check for nulls, you must use `IS NULL` or `IS NOT NULL`.
- **Interviewer looks for**: Three-valued logic (True, False, Unknown) understanding.

---

### 8. What is the difference between `CHAR`, `VARCHAR`, and `NVARCHAR`?

- **Answer**:
  - **`CHAR(N)`**: Fixed-length ASCII string (pads unused space with blanks).
  - **`VARCHAR(N)`**: Variable-length ASCII string (stores only actual characters + 2 bytes overhead).
  - **`NVARCHAR(N)`**: Variable-length Unicode (UTF-16) string (supports international characters/emojis, takes 2 bytes per character).
- **Interviewer looks for**: Storage optimization and Unicode awareness.

---

### 9. What is the purpose of Foreign Keys and Referential Integrity?

- **Answer**: A Foreign Key constraint links a column in a child table to the Primary Key of a parent table, preventing orphan records. It enforces rules on deletion or update via options like `CASCADE` (delete children automatically) or `RESTRICT` / `NO ACTION` (reject delete if children exist).
- **Interviewer looks for**: Cascading actions and orphan record prevention.

---

### 10. What is `AsNoTracking()` in Entity Framework Core?

- **Answer**: `AsNoTracking()` informs EF Core not to track the returned entities in the `ChangeTracker`. It saves substantial CPU and memory allocations by skipping snapshot creation, making read-only queries up to 3x faster.
- **Interviewer looks for**: Understanding EF Core memory allocations and read optimization.

---

## 🟡 Section 2: Intermediate / Mid-Level Questions (11 – 20)

### 11. What is the difference between a Clustered and a Non-Clustered Index?

- **Answer**:
  - **Clustered Index**: Defines the **physical storage order** of data on disk. The leaf nodes contain the **actual data rows**. A table can have only **1** clustered index.
  - **Non-Clustered Index**: A separate B+Tree structure containing the indexed keys and a pointer (or clustered key) back to the row. A table can have multiple non-clustered indexes.
- **Interviewer looks for**: Leaf node structure (data vs pointers) and physical sorting.

---

### 12. What is the N+1 Query Problem in ORMs and how do you resolve it?

- **Answer**: Occurs when an ORM fetches 1 parent record set, then executes $N$ individual database queries to load child collections in a loop.
- **Solutions**:
  1. **Eager Loading**: `.Include(o => o.Items)` (generates a `JOIN`).
  2. **Split Queries**: `.AsSplitQuery()` (executes 2 fast queries, avoiding cartesian explosions).
  3. **DTO Projection**: `.Select(o => new OrderDto { ... })` (fetches only required columns).
- **Interviewer looks for**: Mentioning Cartesian explosion and DTO projection.

---

### 13. What are the 4 Concurrency Anomalies in SQL Isolation Levels?

- **Answer**:
  1. **Dirty Read**: Reading uncommitted data that later rolls back.
  2. **Non-Repeatable Read**: Re-reading the same row within a transaction and seeing modified values.
  3. **Phantom Read**: Re-running a range query and seeing newly inserted rows matching the filter.
  4. **Serialization Anomaly**: Concurrent transactions producing an inconsistent business state impossible in serial execution.
- **Interviewer looks for**: Correlating each anomaly to the 4 standard SQL isolation levels.

---

### 14. How do Common Table Expressions (CTEs) differ from Temporary Tables?

- **Answer**:
  - **CTE (`WITH ... AS`)**: Exists only in memory for the duration of a single statement. Treated like a named subquery by the optimizer.
  - **Temporary Table (`#TempTable`)**: Physically written to temporary storage (`tempdb`). Can have its own **indexes, statistics, and primary keys**, making it superior for complex multi-step stored procedures.
- **Interviewer looks for**: When to choose #Temp tables over CTEs for complex queries.

---

### 15. How do Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`) differ?

- **Answer**:
  - `ROW_NUMBER()`: Always sequential (1, 2, 3, 4) regardless of ties.
  - `RANK()`: Assigns same rank to ties, but **leaves gaps** (1, 2, 2, 4).
  - `DENSE_RANK()`: Assigns same rank to ties **without gaps** (1, 2, 2, 3).
- **Interviewer looks for**: The tie-handling and gap behavior.

---

### 16. What is a Covering Index and why is the `INCLUDE` clause used?

- **Answer**: A Covering Index contains all columns requested by a query. The `INCLUDE` clause appends non-key columns directly to the leaf level of the B+Tree without adding them to branch nodes, keeping the index tree compact while completely eliminating costly **Key Lookups / Bookmark Lookups**.
- **Interviewer looks for**: Elimination of Key Lookups.

---

### 17. How does Optimistic Concurrency work in EF Core?

- **Answer**: Uses a concurrency token column (e.g. `[Timestamp] byte[] RowVersion`). During `SaveChanges()`, EF Core generates `UPDATE ... WHERE Id = @Id AND RowVersion = @OrigVersion`. If another user modified the row first, 0 rows are affected and EF Core throws `DbUpdateConcurrencyException`.
- **Interviewer looks for**: The WHERE clause version comparison mechanism.

---

### 18. What are `ExecuteUpdateAsync()` and `ExecuteDeleteAsync()` in EF Core?

- **Answer**: Introduced in EF Core 7+, they execute bulk `UPDATE` and `DELETE` SQL statements directly on the database in a single roundtrip without loading entities into RAM or using the Change Tracker.
- **Interviewer looks for**: Contrasting with traditional slow `ToList() -> mutate -> SaveChanges()` loops.

---

### 19. What is the Leftmost Prefix Rule in Composite Indexes?

- **Answer**: In a composite index `(ColA, ColB, ColC)`, queries can only use an Index Seek if they filter by `ColA`, or `ColA + ColB`, or `ColA + ColB + ColC`. Filtering only by `ColB` or `ColC` cannot use the index seek because keys are sorted primarily by `ColA`.
- **Interviewer looks for**: Multi-column index traversal logic.

---

### 20. What is the difference between Write-Ahead Logging (WAL) and Checkpointing?

- **Answer**:
  - **WAL**: Sequential log on disk where every change is recorded *before* modifying memory pages, guaranteeing durability.
  - **Checkpoint**: A background process that flushes modified "dirty" pages from the in-memory Buffer Pool to data files on disk, truncating the inactive portion of the WAL.
- **Interviewer looks for**: Database crash recovery and memory-to-disk synchronization.

---

## 🔴 Section 3: Advanced / Senior Questions (21 – 30)

### 21. What happens during a B+Tree Page Split, and how does GUID fragmentation affect performance?

- **Answer**: When inserting a row into a full 8KB database page, the engine must allocate a new page and move 50% of the rows to the new page (**Page Split**). Sequential keys (INT / ULID) always append to the right edge, causing 0 page splits. Random GUIDs (UUIDv4) insert into random locations in the tree, causing massive page splits, heavy disk I/O, and index fragmentation.
- **Interviewer looks for**: Deep storage engine mechanics and Sequential GUID / UUIDv7 solutions.

---

### 22. How does Multi-Version Concurrency Control (MVCC) eliminate read-write blocking?

- **Answer**: Under MVCC (PostgreSQL and SQL Server Snapshot Isolation), writers do not block readers, and readers do not block writers. When a row is modified, the database creates a new version of the row with a transaction timestamp in a version store. Concurrent readers simply read the committed snapshot of data as it existed when their transaction started.
- **Interviewer looks for**: Understanding non-blocking snapshot reads.

---

### 23. What is a Deadlock and how do you resolve it?

- **Answer**: A circular lock dependency where Transaction A waits for a resource locked by Transaction B, while Transaction B waits for a resource locked by Transaction A.
- **Resolution & Prevention**:
  1. The DB Deadlock Monitor terminates the cheapest transaction (victim).
  2. Access tables/resources in the exact same chronological order across all stored procedures.
  3. Keep transactions minimal; never execute HTTP or business processing inside transactions.
  4. Use `NOLOCK` / Snapshot Isolation where dirty reads or snapshots are acceptable.
- **Interviewer looks for**: Systematic prevention strategies (consistent resource ordering).

---

### 24. What is Sargability and how do non-sargable functions destroy query performance?

- **Answer**: A query predicate is Sargable if the engine can perform an **Index Seek**. Wrapping indexed columns in functions (e.g. `WHERE UPPER(Email) = '...'` or `WHERE YEAR(CreatedAt) = 2026`) forces the engine to evaluate the function across every single row in the table, degrading an Index Seek into a **Full Table Scan**.
- **Interviewer looks for**: Writing clean index-seeking range queries.

---

### 25. How do you implement Zero-Downtime Database Migrations in Continuous Deployment?

- **Answer**: By applying the **Expand and Contract Pattern**:
  1. **Expand**: Add new columns as nullable, implement dual-writing in application.
  2. **Migrate**: Backfill legacy data asynchronously in small batches.
  3. **Contract**: Switch application exclusively to the new column, then drop the old column in a subsequent release.
- **Interviewer looks for**: Multi-phase deployment strategies that avoid table locks.

---

### 26. How do you mitigate Cache Stampede (Thundering Herd) with Redis?

- **Answer**: When a hot key expires and thousands of requests miss the cache simultaneously:
  1. **Distributed Mutex (RedLock)**: Only the first request acquires the lock to query the DB and repopulate the cache; other requests wait.
  2. **Probabilistic Early Expiration (XFetch)**: Recomputes cache value in the background before it expires.
  3. **Sliding Expiration + Background Refresh-Ahead Worker**.
- **Interviewer looks for**: Distributed locking and background refresh patterns.

---

### 27. What is the difference between Database Sharding and Partitioning?

- **Answer**:
  - **Table Partitioning**: Dividing a single large table into smaller physical partitions (by date/range) **within the same database instance** on the same server.
  - **Database Sharding**: Distributing data horizontally across **entirely separate database servers**, requiring a routing key (e.g. `Hash(TenantId) % ShardCount`).
- **Interviewer looks for**: Single-instance vs multi-instance distributed architecture.

---

### 28. What is Replication Lag in Read Replicas and how do you handle "Read-Your-Own-Writes"?

- **Answer**: The time delay between committing a write on the Primary database and streaming it to Read Replicas.
- **Handling Read-Your-Own-Writes**:
  - After a user performs a write (e.g. updates profile), route subsequent read queries from that specific user to the **Primary Database for the next 5 seconds**, then revert back to Read Replicas once replication catches up.
- **Interviewer looks for**: Practical CQRS eventual consistency trade-offs.

---

### 29. What is DbContext Pooling in EF Core and how does it improve throughput?

- **Answer**: `AddDbContextPool<T>()` maintains an internal pool of initialized `DbContext` instances. Instead of allocating, configuring, and garbage-collecting a new DbContext on every HTTP request, instances are reset and reused, eliminating GC Gen-0 churn and boosting API throughput by 20%+.
- **Interviewer looks for**: High-throughput ASP.NET Core performance engineering.

---

### 30. How do you diagnose and resolve Slow Running Queries in production?

- **Answer**:
  1. **Identify**: Query Dynamic Management Views (DMVs in SQL Server: `sys.dm_exec_query_stats`) or `pg_stat_statements` in PostgreSQL for highest CPU/duration queries.
  2. **Execution Plan**: Analyze the graphical execution plan for Table Scans, Key Lookups, and high-cost Hash Matches.
  3. **Index Tuning**: Add covering indexes with `INCLUDE` or filtered indexes.
  4. **Statistics**: Update outdated table statistics (`UPDATE STATISTICS`).
  5. **Parameter Sniffing**: Inspect if plan was compiled for unusual parameter values (`OPTIMIZE FOR` or `RECOMPILE`).
- **Interviewer looks for**: Methodological production troubleshooting skills.
