# Module 05: IP Addressing, Subnets, and CIDR

At the Network layer (Layer 3), IP addresses ensure packets route to the correct destination globally or locally. Cloud architectures (like AWS VPCs or Azure VNets) rely entirely on understanding subnetting.

---

## 🌍 1. IPv4 vs IPv6

- **IPv4**: 32-bit addresses (e.g., `192.168.1.5`). Limited to ~4.3 billion addresses, which ran out years ago.
- **IPv6**: 128-bit addresses (e.g., `2001:0db8:85a3:0000:0000:8a2e:0370:7334`). Provides virtually infinite addresses.

Because IPv4 addresses are exhausted, we use **NAT (Network Address Translation)** to allow dozens of private devices to share a single public IPv4 address.

---

## 🏠 2. Public vs Private IPs

**Public IPs** are routable across the global internet.
**Private IPs** are reserved for local area networks (LANs) and cannot be routed on the public internet.

The three private IPv4 ranges (RFC 1918) are:

- `10.0.0.0` to `10.255.255.255` (Massive enterprise networks)
- `172.16.0.0` to `172.31.255.255` (Often used by Docker)
- `192.168.0.0` to `192.168.255.255` (Home routers)

---

## ✂️ 3. CIDR Notation and Subnetting

**CIDR (Classless Inter-Domain Routing)** is the modern way to define a block of IP addresses. It appends a slash and a number (e.g., `/24`) indicating how many bits of the 32-bit IP address represent the **network portion**.

An IPv4 address is 32 bits (4 octets of 8 bits: `11111111.11111111.11111111.00000000`).

### Common CIDR Blocks:

| CIDR | Subnet Mask | Available IPs | Common Use Case |
| :--- | :--- | :--- | :--- |
| **`/32`** | `255.255.255.255` | 1 | A single specific server IP. |
| **`/24`** | `255.255.255.0` | 256 (-2) = 254 | A standard home network or cloud subnet. |
| **`/16`** | `255.255.0.0` | 65,536 (-2) = 65,534 | A large cloud Virtual Private Cloud (VPC). |
| **`/0`** | `0.0.0.0` | All IPs | Default route (the entire internet). |

*(Note: The first IP in a subnet is reserved for the Network ID, and the last is reserved for the Broadcast address).*

---

## ☁️ 4. Subnetting in the Cloud

When you create a cloud environment (e.g., AWS VPC), you divide a large CIDR block into smaller subnets across different Availability Zones (AZs).

**Example Architecture (`10.0.0.0/16` VPC):**

- **Public Subnet A** (`10.0.1.0/24`): Holds Load Balancers and Bastion Hosts. Has an Internet Gateway attached.
- **Private Subnet A** (`10.0.2.0/24`): Holds the .NET Web API instances. No direct internet access. Can only communicate with the Load Balancer.
- **Database Subnet A** (`10.0.3.0/24`): Holds PostgreSQL instances. Extremely locked down.

---

## 🔄 5. Network Address Translation (NAT)

If a .NET API running in a **Private Subnet** needs to download a NuGet package, it has no public IP to reach the internet.

It routes its traffic to a **NAT Gateway** sitting in the **Public Subnet**. The NAT Gateway swaps the internal private IP for its own public IP, forwards the request to the internet, receives the response, and translates it back to the internal server.
