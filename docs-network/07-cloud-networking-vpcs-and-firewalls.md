# Module 07: Cloud Networking, VPCs, and Firewalls

When deploying to Azure, AWS, or Google Cloud, you are responsible for designing the virtual network topology. A poorly configured network exposes internal databases and administrative ports to the public internet.

---

## ☁️ 1. The Virtual Private Cloud (VPC)

A VPC (or Azure VNet) is an isolated, private section of the cloud where you launch resources. You define a primary CIDR block (e.g., `10.0.0.0/16`) for the VPC.

Inside the VPC, you create **Subnets** that reside in different physical data centers (Availability Zones) for fault tolerance.

---

## 🚪 2. Gateways and Routing

How does traffic get in and out of a VPC?

1. **Internet Gateway (IGW)**: Attached to the edge of the VPC. Subnets that have a route to the IGW are considered **Public Subnets**.
2. **NAT Gateway**: Placed inside a Public Subnet. Allows instances in Private Subnets to make *outbound* requests to the internet (e.g., to download OS updates) while blocking all *inbound* internet requests.
3. **Route Tables**: A set of rules associated with a subnet that dictates where network traffic is directed (e.g., "Send all `0.0.0.0/0` traffic to the Internet Gateway").

---

## 🧱 3. Firewalls and Security Groups

Cloud providers use virtual firewalls to control traffic at the instance (VM) level and the subnet level.

### Security Groups (Stateful)

- Attached to the individual VM or container network interface.
- **Stateful**: If you allow an inbound request on port 443, the response is automatically allowed out, regardless of outbound rules.
- **Best Practice**: Default deny all. Only explicitly allow required ports (e.g., Inbound 443 from `0.0.0.0/0`, Inbound 5432 only from the Application Security Group).

### Network Access Control Lists (NACLs) (Stateless)

- Attached to the Subnet boundary.
- **Stateless**: You must explicitly allow inbound traffic AND explicitly allow outbound traffic for the ephemeral response ports.
- **Best Practice**: Use NACLs as a broad defense layer (e.g., blocking a specific malicious IP range globally from the subnet).

---

## 🕵️ 4. The Bastion Host (Jump Box)

If your database and application servers are in Private Subnets, how do you SSH into them for debugging?

You deploy a small, heavily fortified VM called a **Bastion Host** into the Public Subnet.

1. You SSH into the Bastion Host.
2. From the Bastion Host, you SSH into the internal Private Subnet servers.
3. The internal servers' Security Groups are configured to *only* accept SSH (Port 22) traffic from the Bastion Host's internal IP.
