# Module 09: Network Troubleshooting Tools

When a microservice fails to connect to a database, or a web request hangs indefinitely, you need the right command-line tools to diagnose where the connection is dropping in the OSI stack.

---

## 🏓 1. `ping` (ICMP - Layer 3)

Tests basic network connectivity and latency to an IP or domain.

```bash
ping google.com
```

*Note: Many cloud firewalls (like AWS Security Groups) block ICMP ping traffic by default. A failed ping does not necessarily mean the web server is down.*

---

## 🛤️ 2. `traceroute` / `tracert` (ICMP/UDP - Layer 3)

Shows the exact path (router hops) a packet takes across the internet to reach the destination, and how much latency each hop introduces.

```bash
# Windows
tracert google.com

# Linux/macOS
traceroute google.com
```

---

## 🔌 3. `telnet` / `nc` (Netcat) (TCP - Layer 4)

Tests if a specific TCP port is open and accepting connections. Crucial for verifying if a firewall is blocking access to a database.

```bash
# Test if port 5432 (PostgreSQL) is open on the DB server
nc -vz 10.0.3.5 5432

# Or using telnet
telnet 10.0.3.5 5432
```

*If it hangs, a firewall is likely blocking it. If it says "Connection refused," the server is reachable but the database process is not listening on that port.*

---

## 🌐 4. `curl` (HTTP/TLS - Layer 7)

The ultimate tool for debugging web requests, headers, and SSL certificates.

```bash
# Verbose mode: Shows DNS resolution, TCP handshake, TLS negotiation, and HTTP headers
curl -v https://cleanarch.com/api/health

# Send a POST request with JSON
curl -X POST -H "Content-Type: application/json" -d '{"key":"value"}' https://cleanarch.com/api/data
```

---

## 🕵️ 5. `netstat` / `ss` (Local Sockets)

Shows all active network connections and listening ports on the local machine.

```bash
# Linux: Show all listening TCP ports and the process ID holding them
sudo ss -tulpn

# Windows: Show all listening ports and the process ID
netstat -ano | findstr LISTENING
```

---

## 🦈 6. `tcpdump` / Wireshark (Packet Sniffing)

Captures raw network packets entering or leaving a network interface. Used for deep forensic analysis (e.g., verifying if the TCP 3-way handshake is completing).

```bash
# Capture all traffic on port 8080 and save to a file for Wireshark analysis
sudo tcpdump -i eth0 port 8080 -w capture.pcap
```
