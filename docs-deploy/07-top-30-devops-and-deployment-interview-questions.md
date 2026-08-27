# Module 07: Top 30 DevOps, Docker & Cloud Deployment Interview Questions

This guide covers 30 real-world DevOps, Docker, CI/CD, Nginx, and cloud deployment interview questions divided into **Easy (Foundational)**, **Medium (Intermediate)**, and **Advanced (Senior/Architect)** tiers.

---

## 🟢 Part 1: Easy / Foundational Questions (1 - 10)

### 1. What is the difference between a Virtual Machine (VM) and a Docker Container?

- **Virtual Machine**: Virtualizes hardware using a Hypervisor (Type 1 or Type 2). Each VM runs a full guest operating system (OS kernel, binaries, libraries), leading to higher RAM/disk usage (GBs) and minutes of boot time.
- **Docker Container**: Virtualizes the OS kernel using Linux namespaces (`pid`, `net`, `ipc`, `mnt`, `uts`) and control groups (`cgroups`). Containers share the host kernel, isolating only the user space processes. They start in milliseconds and consume minimal memory (MBs).

---

### 2. What is a Docker Multi-Stage build and why is it crucial for .NET and React apps?

A multi-stage build uses multiple `FROM` instructions in a single Dockerfile.

- **Why it matters**: It separates the heavy build environment (SDKs, Node modules, compilers) from the lightweight runtime image.
- **For .NET 10**: The SDK image is ~800MB (`mcr.microsoft.com/dotnet/sdk:10.0`), while the ASP.NET runtime image is only ~100MB (`mcr.microsoft.com/dotnet/aspnet:10.0`). The final production image only copies the compiled `/app/publish` output, minimizing attack surface and download times.

---

### 3. What is the purpose of `.dockerignore`?

`.dockerignore` prevents unnecessary files and directories from being sent to the Docker daemon during the `docker build` context upload.

- **Excluded files**: `.git`, `bin/`, `obj/`, `node_modules/`, `*.db`, `.env` secrets.
- **Benefits**: Faster build context transfers, smaller image sizes, and prevents leaking local passwords or temporary artifacts into image layers.

---

### 4. What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?

- `ENTRYPOINT`: Defines the core executable that will always run when the container starts (e.g., `ENTRYPOINT ["dotnet", "CleanArch.WebApi.dll"]`).
- `CMD`: Provides default arguments to the `ENTRYPOINT`. These arguments can be overridden by passing command-line arguments when executing `docker run`.

---

### 5. Why should you place a Reverse Proxy (like Nginx) in front of ASP.NET Core Kestrel?

Although Kestrel is a high-performance web server, Nginx provides essential enterprise capabilities:

1. **Port Multiplexing**: Exposing multiple services (API on 8080, frontend on 3000) on standard ports 80/443.
2. **TLS/SSL Termination**: Offloading certificate decryption and renegotiation.
3. **Static Asset Caching**: Serving images, JS, CSS directly via kernel `sendfile` without passing through the .NET CLR.
4. **DDoS & Rate Limiting**: Throttling abusive IP traffic before it consumes application memory.

---

### 6. What is the difference between Continuous Delivery and Continuous Deployment?

- **Continuous Delivery (CD)**: Every passing build is automatically packaged, tested, and staged into an artifact repository or staging environment, but releasing to production requires **manual human approval**.
- **Continuous Deployment (CD)**: Every passing commit to `main` is **automatically deployed directly to production** with zero human intervention.

---

### 7. What is the difference between Docker Bind Mounts and Named Volumes?

- **Bind Mounts**: Maps an exact host file system path (e.g., `/home/user/app`) into the container. Dependent on host OS directory structure; great for local dev.
- **Named Volumes**: Managed entirely by Docker in a dedicated storage directory (`/var/lib/docker/volumes/`). Independent of host file structure, isolated, portable, and recommended for production databases.

---

### 8. How do you override nested .NET `appsettings.json` keys using Environment Variables?

In Linux and Docker container environments, colons (`:`) are often invalid in environment variable names. ASP.NET Core translates **double underscores (`__`)** into configuration hierarchy delimiters:

```bash
# Overrides "ConnectionStrings:DefaultConnection"
ConnectionStrings__DefaultConnection="Host=db;..."

# Overrides "Jwt:SecretKey"
Jwt__SecretKey="SuperSecretValue"
```

---

### 9. What are Liveness (`/alive`) and Readiness (`/health`) probes?

- **Liveness Probe (`/alive`)**: Checks if the process is alive. If this fails (e.g., deadlock, out of memory), the orchestrator immediately **kills and restarts** the container.
- **Readiness Probe (`/health`)**: Checks if the application is ready to accept incoming traffic (e.g., database connection established, cache warm). If this fails, traffic is **temporarily diverted** away from the container without restarting it.

---

### 10. Why should production Docker containers run as non-root users (`USER app`)?

Running containers as `root` is a security risk. If an attacker exploits a vulnerability (such as a remote code execution in a dependency), they gain root privileges inside the container, increasing the risk of a container breakout to the host operating system. Using `USER app` restricts process capabilities to unprivileged operations.

---

## 🟡 Part 2: Medium / Intermediate Questions (11 - 20)

### 11. Why is executing `dbContext.Database.Migrate()` on startup an anti-pattern in production?

1. **Concurrency Race Conditions**: In horizontally scaled systems (e.g., 3 Kubernetes replicas starting at once), multiple instances attempt schema changes simultaneously, causing table deadlocks or corrupted migration history.
2. **Security Privilege Escalation**: The web app's database user requires DDL privileges (`ALTER`, `DROP`) instead of least-privilege DML (`SELECT`, `INSERT`, `UPDATE`).
3. **Startup Latency & Timeouts**: Long-running data migrations delay pod startup, triggering orchestrator liveness probe timeout kills.

---

### 12. What are EF Core Migration Bundles and how do they improve CI/CD?

Migration Bundles (`dotnet ef migrations bundle`) compile all EF Core migrations and the migration runtime into a single, standalone binary executable.

- **CI/CD Integration**: The CI pipeline builds the bundle, and the CD deployment pipeline executes `./efbundle --connection "..."` as a pre-deployment step before new web containers spin up.
- **Benefit**: No .NET SDK or source code is required on the deployment target.

---

### 13. How does Docker layer caching work, and how do you optimize a .NET Dockerfile?

Docker caches each command line (`RUN`, `COPY`) as an immutable layer. If the input files have not changed, Docker reuses the cached layer.

- **Optimization Strategy**: Place the least frequently changing instructions first:
  1. `COPY Directory.Build.props *.csproj ./` (Changes rarely)
  2. `RUN dotnet restore` (Downloads dependencies and caches layer)
  3. `COPY . .` (Source code changes frequently)
  4. `RUN dotnet build / publish`

---

### 14. What are Forwarded Headers (`X-Forwarded-For`, `X-Forwarded-Proto`) and how do you handle them in ASP.NET Core?

When Nginx acts as a reverse proxy, Kestrel sees incoming connections originating from `127.0.0.1` over `HTTP`. Nginx adds forwarded headers:

- `X-Forwarded-For`: Original client public IP address.
- `X-Forwarded-Proto`: Original protocol (`https` vs `http`).
- `X-Forwarded-Host`: Original domain requested by user.

In .NET, you must register `app.UseForwardedHeaders()` with `ForwardedHeadersOptions` so `HttpContext.Connection.RemoteIpAddress` and `Request.Scheme` reflect the true client values.

---

### 15. Compare Blue-Green, Rolling, and Canary deployment strategies.

- **Rolling Deployment**: Gradually replaces old container instances with new ones one-by-one. Low resource overhead, but requires backward-compatible database schemas.
- **Blue-Green Deployment**: Spins up an identical new environment (Green) alongside the current live environment (Blue). Once Green passes smoke tests, traffic is switched instantly via the load balancer. Instant rollback, but requires 2x infrastructure cost.
- **Canary Deployment**: Routes a small percentage (e.g., 5%) of real user traffic to the new version. Monitors error rates/logs before rolling out to 100% of users.

---

### 16. How do you configure Nginx to support Single Page Applications (SPA) with client-side routing?

Because React router routes (like `/dashboard/profile`) do not correspond to physical files on the server disk, Nginx returns a `404 Not Found` upon browser refresh without fallback configuration.

- **The Fix**: Use `try_files $uri $uri/ /index.html;`. Nginx checks if the requested URI is a physical file or directory; if not, it serves `index.html`, allowing React Router to handle client navigation.

---

### 17. How do you prevent Docker container logs from filling up host disk space?

By default, Docker's `json-file` logging driver writes logs indefinitely.

- **The Solution**: Configure log rotation in `/etc/docker/daemon.json`:

  ```json
  {
    "log-driver": "json-file",
    "log-opts": { "max-size": "20m", "max-file": "3" }
  }
  ```

This caps each container's log history to 60MB total (3 files × 20MB).

---

### 18. How does rate limiting work at the Reverse Proxy layer?

Nginx uses the **Leaky Bucket algorithm** with `limit_req_zone`:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

- Requests exceeding 10 req/sec are buffered up to the `burst` threshold. Requests beyond the burst limit immediately return `HTTP 429 Too Many Requests`, protecting backend .NET threads from exhaustion.

---

### 19. How do you securely handle secrets in CI/CD pipelines?

1. Store secrets in encrypted repository secrets (e.g., GitHub Actions Secrets, Azure Key Vault).
2. Inject secrets only at runtime via environment variables or secret files.
3. Mask secret values in build logs.
4. Never check `.env` files into source control; use `.env.example` templates.
5. Use ephemeral, short-lived tokens (like GitHub OIDC tokens) instead of long-lived static passwords.

---

### 20. What is the difference between Horizontal and Vertical scaling?

- **Vertical Scaling (Scale Up)**: Adding more CPU, RAM, or disk to an existing single server. Simple, but hits a physical hardware ceiling and introduces a single point of failure.
- **Horizontal Scaling (Scale Out)**: Adding more server instances or container replicas behind a load balancer. Provides high availability, resilience, and unlimited scaling potential.

---

## 🔴 Part 3: Advanced / Senior Questions (21 - 30)

### 21. Explain the "Expand and Contract" pattern for Zero-Downtime database migrations.

When upgrading database schemas without downtime, old and new code versions run simultaneously during rollout.

1. **Phase 1 (Expand)**: Add the new column/table in a non-breaking way (e.g., nullable column `FirstName` and `LastName`). Deploy the migration.
2. **Phase 2 (Parallel Run)**: Deploy application version that writes to both old (`FullName`) and new columns, and reads from the new column with fallback.
3. **Phase 3 (Backfill)**: Run background worker script to migrate legacy rows.
4. **Phase 4 (Contract)**: Deploy updated app that only uses new columns. Drop the old column `FullName` in a subsequent migration.

---

### 22. How do you harden container security for enterprise production?

1. **Non-Root User**: Run with `USER app` or specific UID.
2. **Read-Only Root Filesystem**: Use `--read-only` with ephemeral `tmpfs` mounts for `/tmp`.
3. **Drop Linux Capabilities**: `cap_drop: ALL` and only add required caps (e.g., `NET_BIND_SERVICE`).
4. **Distroless / Chiseled Base Images**: Strip out shells (`/bin/sh`, `/bin/bash`), package managers (`apt`, `apk`), and debugging utilities from final runtime image.
5. **Vulnerability Scanning**: Automated image scanning in CI using tools like **Trivy** or **Snyk**.

---

### 23. How does .NET Aspire facilitate cloud deployment to Azure Container Apps (ACA)?

.NET Aspire represents distributed applications as an executable dependency graph in `CleanArch.AppHost`.

- **Azure Developer CLI (`azd`)**: Inspects the AppHost project, compiles the dependency graph, generates Bicep Infrastructure-as-Code templates, creates Azure Container Registry (ACR), and provisions Container Apps with mutual TLS, service discovery, and OpenTelemetry logging out-of-the-box.

---

### 24. How do you troubleshoot an `HTTP 502 Bad Gateway` error in an Nginx + .NET Kestrel architecture?

A `502 Bad Gateway` means Nginx was unable to communicate with the upstream backend.

- **Troubleshooting Steps**:
  1. Check if backend container is running: `docker compose ps` / `systemctl status`.
  2. Inspect Nginx error logs: `tail -n 50 /var/log/nginx/error.log` (e.g., `Connection refused`, `upstream timed out`).
  3. Verify port binding and host resolution: Check if Kestrel is listening on `0.0.0.0:8080` (inside container) vs `127.0.0.1:8080`.
  4. Inspect .NET application logs for fatal startup exceptions (e.g., missing database connection string, invalid JWT secret).

---

### 25. Explain the TLS 1.3 Handshake and the difference between SSL Termination vs SSL Pass-Through.

- **TLS 1.3 Handshake**: Reduces handshake latency to **1-RTT** (Round Trip Time) by combining key exchange (`Diffie-Hellman`) and cipher suite negotiation into the initial `ClientHello`. Supports 0-RTT session resumption.
- **SSL Termination**: The reverse proxy (Nginx) decrypts the HTTPS traffic. Traffic between proxy and backend travels over private network as HTTP. Allows proxy to inspect HTTP headers, cache responses, and perform WAF filtering.
- **SSL Pass-Through**: The reverse proxy forwards encrypted TCP packets directly to the backend without decrypting. Ensures end-to-end encryption, but prevents proxy from inspecting headers or caching.

---

### 26. How does Distributed Tracing propagate across microservice boundaries in .NET?

Using the **W3C Trace Context** standard:

- Outgoing HTTP requests include `traceparent` header: `version-traceid-parentid-traceflags` (e.g., `00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01`).
- ASP.NET Core and OpenTelemetry middleware automatically parse `traceparent`, attaching the `TraceId` to `Activity.Current` and Serilog `LogContext`, allowing all downstream services to correlate logs to a single user action.

---

### 27. How does Kubernetes Horizontal Pod Autoscaler (HPA) differ from KEDA?

- **HPA (Horizontal Pod Autoscaler)**: Scales pods based strictly on resource metrics (CPU and Memory utilization percentage).
- **KEDA (Kubernetes Event-driven Autoscaling)**: Extends HPA to scale pods based on **external event metrics** (e.g., number of messages in RabbitMQ / Azure Service Bus queue, Kafka lag, database record count). Allows scaling from/to **zero** instances.

---

### 28. What is Infrastructure as Code (IaC) and how do Terraform and Bicep differ from Container Orchestration?

- **IaC (Terraform / Bicep)**: Provisions and manages the **underlying cloud infrastructure** (Virtual Networks, Subnets, Managed Databases, Key Vaults, Kubernetes Clusters).
- **Container Orchestration (Kubernetes / Docker Swarm)**: Manages the **lifecycle of containers** (scheduling, scaling, health checking, service discovery) running on top of the provisioned infrastructure.

---

### 29. How do you design an automated RPO and RTO strategy for database backups?

- **RPO (Recovery Point Objective)**: The maximum acceptable data loss measured in time.
  - *Strategy*: Continuous WAL (Write-Ahead Logging) archiving / point-in-time recovery (PITR) to cloud object storage (S3/Azure Blob) to achieve RPO < 5 minutes.
- **RTO (Recovery Time Objective)**: The maximum acceptable downtime to restore the database.
  - *Strategy*: Automated restore verification scripts and standby replicas (Warm/Hot standby) to achieve RTO < 15 minutes.

---

### 30. How do you implement Zero-Downtime Rollback if a production deployment introduces critical runtime bugs?

1. **Automated Smoke Tests**: CI/CD runs automated post-deployment synthetic requests against `/health` and critical API routes.
2. **Container Tag Immutability**: Deployments reference immutable image tags (`ghcr.io/app:commit-sha`), never mutable `:latest`.
3. **Instant Traffic Switching**: If smoke tests fail or error rate exceeds threshold within 5 minutes, the load balancer or blue/green switch immediately reverts traffic back to the previous stable container tag without needing a full recompilation.
