# 06 - Asynchronous Messaging, Event-Driven Architecture & Message Queues

Asynchronous messaging decouples microservices, absorbs traffic spikes, guarantees eventual consistency, and enables event-driven architectures.

---

## 1. Message Brokers vs. Distributed Event Logs

```text
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ MESSAGE BROKERS (RabbitMQ / Amazon SQS)                     │ DISTRIBUTED EVENT LOGS (Apache Kafka / AWS Kinesis)         │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ • Point-to-Point queues & Smart Broker / Dumb Consumer.     │ • Append-only, partitioned commit log.                      │
│ • Message is DELETED once acknowledged by consumer.         │ • Messages are PERSISTED on disk (retained for days/weeks). │
│ • Use Case: Task distribution, email workers, batch jobs.   │ • Multiple consumer groups can replay events from offset.   │
│ • Throughput: ~10,000 - 50,000 msgs/sec.                    │ • Throughput: 1,000,000+ msgs/sec.                          │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Delivery Guarantees & Idempotency

```text
┌────────────────────┬──────────────────────────────────┬─────────────────────────────────────┐
│ Guarantee Level    │ Mechanism                        │ Reality                             │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ At-Most-Once       │ Fire and forget; never retried.  │ Messages can be lost on failure.    │
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ At-Least-Once      │ Acknowledged & retried on error. │ Duplicates WILL occur on network lag│
├────────────────────┼──────────────────────────────────┼─────────────────────────────────────┤
│ Exactly-Once       │ At-least-once transport paired   │ The industry gold standard for      │
│                    │ with **Idempotent Consumers**.   │ distributed event processing!       │
└────────────────────┴──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. The Transactional Outbox Pattern

When a business operation updates a database AND sends a message to Kafka/RabbitMQ, a network failure between the two operations can cause data inconsistency (DB committed, but message never sent).

```text
   [Application Service]
             │
             ├──► 1. Begin Database Transaction
             ├──► 2. Save Business Entity (e.g. Orders Table)
             ├──► 3. Insert Message into [OutboxMessages] Table (Same Local DB Transaction!)
             └──► 4. Commit Transaction (100% Atomicity Guaranteed!)
                         │
                         ▼
        [Outbox Background Publisher / Debezium CDC]
                         │
                         └──► Reads [OutboxMessages] ──► Publishes to Apache Kafka
```

### Outbox Table Schema in EF Core:

```sql
CREATE TABLE OutboxMessages (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Type NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    OccurredOnUtc DATETIME2 NOT NULL,
    ProcessedOnUtc DATETIME2 NULL,
    Error NVARCHAR(MAX) NULL
);
```
