# 09 - Real-World System Design Case Studies

This module explores end-to-end architectural designs for four classic, high-frequency distributed system design problems.

---

## 1. Case Study 1: Global URL Shortener (TinyURL / Bitly)

### Requirements & Numbers:

- **Write QPS**: 100 URL creations/second.
- **Read QPS**: 10,000 redirections/second ($100:1$ Read-to-Write ratio).
- **Redirection**: HTTP `302 Found` (for analytics) or `301 Moved Permanently` (for browser caching).

### Key Generation Strategy:

Instead of computing MD5/SHA-256 and handling collisions, use a distributed unique 64-bit ID generator (e.g. Twitter Snowflake or Redis sequence) and convert the ID to **Base62** (`[a-z, A-Z, 0-9]`):

- A 7-character Base62 string yields $62^7 \approx 3.5 \text{ Trillion}$ unique short URLs!

```text
User ──► [CDN / Edge Cache] ──► [API Gateway] ──► [Redis Cache (Hot URLs)] ──► [NoSQL DB (DynamoDB)]
```

---

## 2. Case Study 2: E-Commerce Flash Sale & Inventory Reservation

### The Challenge:

10,000 items available, but 1,000,000 users click "Buy Now" at the exact same millisecond. Traditional SQL `UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock > 0` causes massive database lock contention and connection pool exhaustion.

```text
 Client ──► [Nginx / Rate Limiter (Token Bucket)]
                  │
                  ▼
         [Redis Lua Script (Atomic Stock Deduction)]
                  │
         ┌────────┴────────┐
         ▼ [Stock > 0]     ▼ [Stock == 0]
    [Kafka Queue]        Return "Sold Out" (400)
         │
         ▼
  [Async Order Creation Worker] ──► [Database (Writes without locking!)]
```

### Atomic Redis Lua Script:

```lua
-- KEYS[1]: product_stock_key, ARGV[1]: quantity_to_buy
local currentStock = redis.call('get', KEYS[1])
if not currentStock or tonumber(currentStock) < tonumber(ARGV[1]) then
    return 0 -- Sold out / Insufficient stock
else
    redis.call('decrby', KEYS[1], ARGV[1])
    return 1 -- Reservation success
end
```

---

## 3. Case Study 3: Real-Time Chat & Notification System (WhatsApp / Slack)

```text
                                  REAL-TIME CHAT ARCHITECTURE
                                  
  Sender (Mobile) ──► [WebSocket Gateway Server A]
                                │
                                ├──► Save to Cassandra / ScyllaDB (LSM-Tree write)
                                │
                                ▼
                       [Redis Pub/Sub / Kafka]
                                │
                                ▼
                      [WebSocket Gateway Server B]
                                │
                                ▼
                     Receiver (Desktop Web Client)
```

- **WebSocket Connection Servers**: Stateful servers maintaining persistent TCP connections.
- **User-to-Server Mapping**: Stored in Redis (e.g., `User_123 ➔ Server_B_IP`).
- **Storage**: Apache Cassandra partitioned by `ConversationId` with clustering key `TimestampUtc DESC`.
