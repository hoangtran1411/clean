# Module 06: Load Balancing and Reverse Proxies

As applications scale beyond a single server, load balancers and reverse proxies become critical infrastructure components for high availability.

---

## ⚖️ 1. L4 vs L7 Load Balancing

Load balancers distribute incoming traffic across multiple backend servers. They operate at two different OSI layers:

### Layer 4 (Transport Layer)

- **How it works**: Routes traffic based purely on IP address and TCP/UDP ports. It does not look at the HTTP payload.
- **Speed**: Extremely fast (often hardware-accelerated).
- **Use Case**: Database clustering, raw TCP streaming, or when SSL termination is handled by the backend servers.
- **Example**: AWS Network Load Balancer (NLB).

### Layer 7 (Application Layer)

- **How it works**: Terminates the SSL/TCP connection, inspects the HTTP headers and URL path, and makes intelligent routing decisions before establishing a new connection to the backend.
- **Features**:
  - Path-based routing (e.g., `/api/*` goes to .NET servers, `/images/*` goes to S3).
  - Sticky Sessions (session affinity based on cookies).
  - Web Application Firewalls (WAF) blocking malicious payloads.
- **Example**: Nginx, AWS Application Load Balancer (ALB), Azure Front Door.

---

## 🔄 2. Load Balancing Algorithms

When a load balancer receives a request, how does it choose which backend server to send it to?

1. **Round Robin**: Distributes requests sequentially (Server 1, Server 2, Server 3, Server 1...). Good for identical, stateless servers.
2. **Least Connections**: Sends the request to the server with the fewest active TCP connections. Best for long-lived connections (like WebSockets).
3. **IP Hash**: Hashes the client's IP address to mathematically guarantee that a specific user is always routed to the exact same backend server. Useful for legacy stateful applications (though modern apps should store session state externally in Redis).

---

## 🛡️ 3. Reverse Proxy vs Forward Proxy

### Forward Proxy (Protects the Client)

Sits in front of client machines (e.g., inside a corporate office network).

- **Purpose**: Controls outgoing traffic. Blocks employees from visiting malicious sites, caches outbound requests, and masks the employees' IPs from the internet.

### Reverse Proxy (Protects the Server)

Sits in front of your web servers (e.g., Nginx in front of Kestrel).

- **Purpose**: Controls incoming traffic. Hides the internal network topology, handles SSL termination, and balances load. To the internet user, the reverse proxy *is* the web server.

---

## 🩺 4. Health Checks

A load balancer is only useful if it knows which backend servers are healthy. It continuously polls a specific endpoint (e.g., `/health`).

- **Unhealthy Threshold**: If the server returns HTTP 500 or times out 3 times in a row, it is removed from the routing pool.
- **Healthy Threshold**: When the server returns HTTP 200 for 2 consecutive checks, it is added back to the pool.
