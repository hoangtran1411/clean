# 02 - Distributed System Theorems: CAP, PACELC & Consistency Models

When designing distributed databases and storage systems, physical constraints (speed of light, network partition failures) dictate fundamental architectural trade-offs.

---

## 1. The CAP Theorem (Brewer's Theorem)

In any asynchronous distributed data store, you can guarantee at most **two out of three** properties:

```text
                            ┌───────────────────────────────────┐
                            │           CONSISTENCY (C)         │
                            │  Every read receives the most     │
                            │  recent write or an error.        │
                            └─────────────────┬─────────────────┘
                                             / \
                                            /   \
                                           /     \
                                          /  CAP  \
                                         /         \
    ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
    │          AVAILABILITY (A)         │───────────│      PARTITION TOLERANCE (P)      │
    │  Every non-failing node returns a │           │  System continues to operate      │
    │  valid response (no errors).      │           │  despite dropped network packets. │
    └───────────────────────────────────┘           └───────────────────────────────────┘
```

> [!IMPORTANT]
> **Partition Tolerance (P) is mandatory** in real-world networks because physical network cables, routers, and switches will inevitably drop packets or experience latency partitions.
> Therefore, the real architectural choice is between **CP (Consistency + Partition Tolerance)** and **AP (Availability + Partition Tolerance)** during a network partition!

---

## 2. The PACELC Theorem (Extending CAP)

Daniel Abadi formulated PACELC to describe trade-offs during both **Partition** and **Normal (Else)** states:

$$\text{If } \mathbf{P} \text{ (Partition)} \rightarrow \text{Choose between } \mathbf{A} \text{ and } \mathbf{C}; \quad \mathbf{E} \text{lse (Normal State)} \rightarrow \text{Choose between } \mathbf{L} \text{ (Latency) and } \mathbf{C} \text{ (Consistency)}$$

| System | Classification | Behavior during Partition | Behavior in Normal State |
| :--- | :--- | :--- | :--- |
| **MongoDB / Redis / Spanner** | **PC / EC** | Preserves Consistency (rejects writes on isolated nodes). | Prioritizes Consistency (waits for replica acknowledgments). |
| **Cassandra / DynamoDB** | **PA / EL** | Preserves Availability (accepts writes anywhere). | Prioritizes Latency (returns quickly with eventual replication). |

---

## 3. The Spectrum of Consistency Models

```text
 Strongest ─────────────────────────────────────────────────────────────────────────────► Weakest
 
 ┌───────────────┐   ┌───────────────┐   ┌───────────────────┐   ┌────────────────────────┐
 │ Linearizable  │ ─►│  Sequential   │ ─►│  Causal / Read-   │ ─►│  Eventual Consistency  │
 │ (Global clock │   │ (Program order│   │  Your-Writes      │   │ (Converges over time   │
 │  instant sync)│   │  preserved)   │   │  (No causal drift)│   │  with zero guarantees) │
 └───────────────┘   └───────────────┘   └───────────────────┘   └────────────────────────┘
```

---

## 4. Distributed Transactions: 2PC vs. Saga Pattern

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ TWO-PHASE COMMIT (2PC - Synchronous / Blocking)             │ SAGA PATTERN (Asynchronous Compensating Transactions)       │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 1. Prepare Phase: Coordinator asks all nodes to lock.       │ Series of local transactions. Each updates its own DB.      │
│ 2. Commit Phase: If all agree, commit; else abort.          │ If Step 3 fails, compensating transactions execute backwards│
│ ❌ Fragile: Locks database rows, vulnerable to coordinator  │ to rollback Steps 2 and 1 (e.g. Refund Payment ➔ Cancel).   │
│    crash (poor scalability).                                │ ✅ Scalable, highly available, no distributed row locks!    │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```
