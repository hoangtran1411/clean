# Network Architecture & Protocols Learning Path

Welcome to the comprehensive Networking guide for the **Clean Architecture .NET 10 & React 19 Enterprise Stack**. This documentation covers foundational networking concepts, protocols, troubleshooting, and cloud networking topologies.

---

## 📚 Networking Curriculum Modules

1. [**01 - The OSI Model and TCP/IP Suite**](../docs-network/01-osi-model-and-tcp-ip-suite.md)
   - 7 layers of OSI vs TCP/IP
   - Data encapsulation (Segments, Packets, Frames)
2. [**02 - DNS Resolution and Record Types**](../docs-network/02-dns-resolution-and-record-types.md)
   - The DNS lookup process and caching
   - A, CNAME, TXT, MX records and TTL
3. [**03 - TCP vs UDP and the Transport Layer**](../docs-network/03-tcp-udp-and-transport-layer.md)
   - TCP 3-way handshake and 4-way teardown
   - UDP speed vs TCP reliability
4. [**04 - HTTP, HTTPS, and the TLS Handshake**](../docs-network/04-http-https-and-tls-handshake.md)
   - HTTP/1.1 vs HTTP/2 (Multiplexing) vs HTTP/3 (QUIC)
   - TLS 1.2 (2-RTT) vs TLS 1.3 (1-RTT) handshakes and SNI
5. [**05 - IP Addressing, Subnets, and CIDR**](../docs-network/05-ip-addressing-subnets-and-cidr.md)
   - IPv4 vs IPv6, Public vs Private IPs
   - CIDR notation (e.g., `/24`) and Network Address Translation (NAT)
6. [**06 - Load Balancing and Reverse Proxies**](../docs-network/06-load-balancing-and-reverse-proxies.md)
   - Layer 4 vs Layer 7 load balancing
   - Forward vs Reverse Proxies, and Health Checks
7. [**07 - Cloud Networking, VPCs, and Firewalls**](../docs-network/07-cloud-networking-vpcs-and-firewalls.md)
   - Virtual Private Clouds (VPC), Public vs Private Subnets
   - Stateful Security Groups vs Stateless NACLs, Bastion Hosts
8. [**08 - Content Delivery Networks (CDNs)**](../docs-network/08-content-delivery-networks-cdns.md)
   - Edge caching, Anycast routing, Cache invalidation strategies
9. [**09 - Network Troubleshooting Tools**](../docs-network/09-network-troubleshooting-tools.md)
   - `ping`, `traceroute`, `telnet`, `curl`, `netstat`, `tcpdump`
10. [**10 - Top 30 Networking Interview Questions (Easy, Medium, Advanced)**](../docs-network/10-top-30-networking-interview-questions.md)
    - Essential interview prep for software engineers handling distributed systems.

---

## ⚡ Quick Networking Cheat Sheet

```bash
# Test connectivity to a port (TCP layer 4)
# Windows
Test-NetConnection -ComputerName google.com -Port 443
# Linux
nc -vz google.com 443

# Check DNS resolution
Resolve-DnsName google.com
dig google.com A

# Trace route to destination
tracert google.com

# Inspect HTTP headers and TLS handshake
curl -v https://google.com
```
