# Module 10: Top 30 Networking Interview Questions

This guide covers 30 real-world networking interview questions tailored for software engineers, divided into **Easy (Foundational)**, **Medium (Intermediate)**, and **Advanced (Architectural)** tiers.

---

## 🟢 Part 1: Easy / Foundational Questions (1 - 10)

### 1. What happens at the network level when you type `google.com` into your browser?

1. **DNS Resolution**: Browser checks cache, OS cache, then asks the DNS resolver to translate `google.com` to an IP address.
2. **TCP Handshake**: Browser initiates a 3-way TCP handshake (SYN, SYN-ACK, ACK) to port 443.
3. **TLS Handshake**: Client and server negotiate encryption ciphers and exchange keys.
4. **HTTP Request**: Browser sends an encrypted HTTP GET request.
5. **HTTP Response**: Server sends the HTML payload.
6. **Rendering**: Browser parses HTML, requests CSS/JS, and renders the page.

### 2. What is the difference between TCP and UDP?

- **TCP (Transmission Control Protocol)**: Connection-oriented, reliable, guarantees in-order delivery. Uses a 3-way handshake. (e.g., HTTP, Database connections).
- **UDP (User Datagram Protocol)**: Connectionless, unreliable, best-effort delivery. Faster, with no handshake overhead. (e.g., Video streaming, DNS, VoIP).

### 3. What is the difference between an IP Address and a MAC Address?

- **IP Address (Layer 3)**: Logical address assigned by a network (e.g., `192.168.1.10`). Routable across the internet.
- **MAC Address (Layer 2)**: Physical hardware address burned into the network interface card (e.g., `00:1A:2B:3C:4D:5E`). Used only for local node-to-node communication on the same subnet.

### 4. What are the common HTTP status code families?

- **2xx (Success)**: 200 OK, 201 Created.
- **3xx (Redirection)**: 301 Moved Permanently, 302 Found, 304 Not Modified.
- **4xx (Client Error)**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found.
- **5xx (Server Error)**: 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable.

### 5. What is DNS and what is an 'A' Record vs a 'CNAME' Record?

DNS (Domain Name System) translates domains to IPs.

- **A Record**: Maps a domain directly to an IPv4 address.
- **CNAME Record**: Maps a domain to another domain alias (never directly to an IP).

### 6. What is a Subnet Mask?

A subnet mask divides an IP address into a Network portion and a Host portion. For example, in a `255.255.255.0` (or `/24`) mask, the first three octets represent the network, and the last octet represents the specific device on that network.

### 7. What is the difference between HTTP and HTTPS?

HTTP transmits data in plaintext, susceptible to packet sniffing. HTTPS encrypts the HTTP payload using TLS/SSL, ensuring data privacy, integrity, and server authentication.

### 8. What port does HTTP, HTTPS, and SSH use by default?

- HTTP: 80
- HTTPS: 443
- SSH: 22

### 9. What is a Reverse Proxy?

A server that sits in front of backend web servers and intercepts incoming client requests. It provides load balancing, SSL termination, caching, and hides the internal network topology from the internet (e.g., Nginx, HAProxy).

### 10. How does a ping work?

Ping uses the ICMP protocol (Layer 3). It sends an Echo Request packet to the destination IP and waits for an Echo Reply packet, measuring the round-trip time.

---

## 🟡 Part 2: Medium / Intermediate Questions (11 - 20)

### 11. What is the OSI Model and what happens at Layer 4 vs Layer 7?

The OSI model has 7 layers.

- **Layer 4 (Transport)**: TCP/UDP. Deals with ports, reliability, and flow control. A Layer 4 load balancer routes traffic based solely on IP and Port.
- **Layer 7 (Application)**: HTTP/HTTPS. Deals with application data. A Layer 7 load balancer can route traffic based on HTTP headers, URLs, or cookies.

### 12. Explain the TCP 3-Way Handshake.

1. **SYN**: Client sends a sequence number to initiate a connection.
2. **SYN-ACK**: Server acknowledges the client's SYN and sends its own SYN sequence number.
3. **ACK**: Client acknowledges the server's SYN. The connection is established.

### 13. What is NAT (Network Address Translation)?

NAT allows multiple devices on a private local network (using private IPs like `192.168.x.x`) to share a single public IP address when accessing the internet. The router modifies the source IP and port of outgoing packets and keeps a translation table to route the response back to the correct internal device.

### 14. What is a Content Delivery Network (CDN) and how does it improve performance?

A CDN caches static assets (images, JS, CSS) on edge servers distributed globally. When a user requests a file, it is served from the geographically closest edge server, drastically reducing latency and offloading traffic from the origin server.

### 15. What is the difference between IPv4 and IPv6?

IPv4 uses 32-bit addresses, allowing ~4.3 billion unique IPs (which are exhausted). IPv6 uses 128-bit addresses, allowing a virtually infinite number of IPs, eliminating the need for NAT.

### 16. What does the CIDR notation `/24` mean?

It means the first 24 bits of the 32-bit IP address represent the network identifier. It provides a subnet with 256 IP addresses (254 usable for hosts).

### 17. How do you troubleshoot a "Connection Refused" vs "Connection Timeout" error?

- **Connection Refused (RST packet)**: The server was reached, but no process is listening on the requested port.
- **Connection Timeout**: The packet was dropped silently. Usually indicates a firewall (Security Group/UFW) is blocking the port, or the server is completely down.

### 18. What is HTTP/2 Multiplexing?

In HTTP/1.1, each request required its own TCP connection or suffered from head-of-line blocking. HTTP/2 allows multiple concurrent requests and responses to be intertwined over a single TCP connection, drastically improving page load times.

### 19. What is SNI (Server Name Indication)?

An extension to the TLS protocol. It allows the client to specify the domain name it is trying to connect to during the initial TLS handshake. This enables a single server with one IP address to serve multiple HTTPS websites with different certificates.

### 20. How does a Load Balancer know if a backend server is healthy?

The load balancer performs continuous health checks (e.g., an HTTP GET to `/health`). If the server returns a 200 OK, it receives traffic. If it times out or returns a 5xx error multiple times, it is removed from the active routing pool.

---

## 🔴 Part 3: Advanced / Architectural Questions (21 - 30)

### 21. Explain how the TLS 1.3 handshake improves upon TLS 1.2.

TLS 1.2 requires 2 Round Trips (2-RTT) to establish secure communication. TLS 1.3 combines the cipher negotiation and key exchange into a single step, reducing it to 1-RTT. TLS 1.3 also introduces 0-RTT for resumed connections, drastically reducing latency for returning visitors.

### 22. What is Anycast routing?

Anycast allows multiple servers around the world to advertise the exact same IP address. The internet's BGP routing protocol automatically directs the user's packet to the server geographically closest to them. This is how CDNs and root DNS servers achieve global low latency.

### 23. What is BGP (Border Gateway Protocol)?

BGP is the routing protocol that makes the global internet work. It allows Autonomous Systems (like ISPs and cloud providers) to exchange routing information and determine the most efficient path for packets to travel across the internet backbone.

### 24. Explain the concept of Head-of-Line Blocking in TCP vs QUIC (HTTP/3).

In TCP, if a single packet is lost, the entire stream halts until that packet is retransmitted and received (Head-of-line blocking). HTTP/3 replaces TCP with QUIC (built on UDP). In QUIC, multiplexed streams are independent; if a packet belonging to Stream A is lost, Stream B continues processing without delay.

### 25. What is an ephemeral port exhaustion issue?

When a server makes an outbound connection (e.g., a Web API calling a database), it uses a random ephemeral port (range 49152–65535). If the server makes thousands of connections per second and doesn't reuse them (e.g., not using HttpClientFactory or connection pooling), it will run out of available ports, causing new outbound connections to fail.

### 26. How do you design a VPC architecture for a secure 3-tier application in the cloud?

1. **Public Subnet**: Contains the Internet Gateway, NAT Gateway, and Application Load Balancer.
2. **Private App Subnet**: Contains the Web API VMs/Containers. No public IPs. Outbound internet via NAT. Inbound traffic only from the Load Balancer.
3. **Private Data Subnet**: Contains the Database. No internet access. Inbound traffic only from the App Subnet.

### 27. What is a Bastion Host (Jump Box)?

A highly secured server deployed in a public subnet. Administrators SSH into the Bastion Host first, and from there, SSH into the internal backend servers located in private subnets. This prevents exposing internal servers directly to the internet.

### 28. What is the difference between Stateful and Stateless Firewalls (e.g., AWS Security Groups vs NACLs)?

- **Stateful (Security Groups)**: If you allow inbound traffic on port 443, the outbound response is automatically allowed, regardless of outbound rules.
- **Stateless (NACLs)**: Evaluates every packet individually. If you allow inbound traffic on port 443, you must explicitly create a rule to allow outbound traffic on the ephemeral response ports.

### 29. How does WebSocket communication differ from standard HTTP?

Standard HTTP is unidirectional and half-duplex (client requests, server responds, connection closes or idles). WebSockets begin with an HTTP Upgrade request, then transition into a persistent, bidirectional, full-duplex TCP connection where the server can push data to the client at any time without polling.

### 30. How would you mitigate a volumetric DDoS attack against your web API?

1. **Edge Mitigation**: Place a CDN/WAF (Cloudflare/AWS Shield) in front to absorb traffic spikes and filter malicious signatures globally.
2. **Rate Limiting**: Implement strict rate limiting at the reverse proxy (Nginx) and API gateway layers.
3. **Auto-scaling**: Ensure the infrastructure can horizontally scale to absorb legitimate traffic surges.
4. **Caching**: Cache expensive API responses aggressively to reduce database load.
