# Module 03: TCP vs UDP and the Transport Layer

The Transport layer (OSI Layer 4) handles end-to-end communication between applications. The two dominant protocols are **TCP** (Transmission Control Protocol) and **UDP** (User Datagram Protocol).

---

## 🤝 1. TCP (Transmission Control Protocol)

TCP is **connection-oriented** and **reliable**. It guarantees that all packets arrive in the correct order, without corruption or loss.

**Use cases**: HTTP/HTTPS (Web APIs), SSH, Database connections, File Transfers.

### The 3-Way Handshake

Before sending data, TCP establishes a connection using a 3-way handshake:

1. **SYN**: Client asks to sync (connect).
2. **SYN-ACK**: Server acknowledges the request and sends its own sync.
3. **ACK**: Client acknowledges the server's sync. Connection established.

### The 4-Way Teardown

When closing a connection, TCP performs a 4-step termination:

1. **FIN**: Client says it is done sending.
2. **ACK**: Server acknowledges.
3. **FIN**: Server says it is done sending.
4. **ACK**: Client acknowledges. Connection closed.

### Key TCP Features

- **Reliability & Retransmission**: If a packet is lost, the receiver does not send an ACK, forcing the sender to retransmit it.
- **Flow Control**: The receiver tells the sender how much data it can handle at once (Receive Window) so it doesn't get overwhelmed.
- **Congestion Control**: The sender detects network congestion and slows down transmission (Slow Start algorithm).

---

## 🚀 2. UDP (User Datagram Protocol)

UDP is **connectionless** and **unreliable**. It sends packets (datagrams) into the network without checking if they arrived. It has no handshake, no acknowledgments, and no flow control.

**Use cases**: Live video streaming (WebRTC), Multiplayer gaming, VoIP, DNS queries, IoT sensor telemetry.

### Why use UDP?

- **Speed**: No handshake latency (saves 1-RTT).
- **No Head-of-Line Blocking**: If a packet is dropped, UDP doesn't pause to wait for a retransmission. It just plays the next packet (e.g., a glitch in a video stream is better than pausing the stream to retrieve a 2-second-old frame).

---

## 📊 3. TCP vs UDP Comparison Matrix

| Feature | TCP | UDP |
| :--- | :--- | :--- |
| **Connection Setup** | 3-Way Handshake | None (Fire and Forget) |
| **Reliability** | Guaranteed Delivery | Best Effort (Packets can be lost) |
| **Ordering** | In-order delivery guaranteed | Packets may arrive out of order |
| **Header Size** | 20 bytes (Heavy) | 8 bytes (Lightweight) |
| **Speed** | Slower (Overhead & Retries) | Fast (Low latency) |

---

## 🔌 4. Ports and Sockets

A **Socket** is defined by an IP Address and a Port Number (e.g., `203.0.113.5:8080`).

- **Well-Known Ports (0 - 1023)**: Reserved for standard services (`80` HTTP, `443` HTTPS, `22` SSH).
- **Registered Ports (1024 - 49151)**: Used by specific applications (`1433` SQL Server, `5432` PostgreSQL).
- **Ephemeral Ports (49152 - 65535)**: Temporarily assigned to client applications when establishing outbound connections.

> [!TIP]  
> If an ASP.NET Core API fails to start with `EADDRINUSE`, another process is already bound to that port. Use `netstat -ano | findstr :8080` on Windows to find the blocking Process ID (PID).
