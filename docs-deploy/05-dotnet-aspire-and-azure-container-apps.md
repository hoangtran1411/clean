# Module 05: .NET Aspire & Azure Container Apps (Cloud-Native Deployment)

**.NET Aspire** is not just for local development—it acts as an application model and topology manifest that can be seamlessly deployed to cloud platforms like **Azure Container Apps (ACA)** or **Kubernetes** using automated tools.

---

## 🏛️ 1. .NET Aspire in the Deployment Lifecycle

```mermaid
flowchart TD
    A["CleanArch.AppHost (C# Topology Definition)"] -->|azd (Azure Developer CLI)| B["Azure Container Apps (Serverless Microservices)"]
    A -->|aspirate CLI| C["Kubernetes Manifests / Helm Charts"]
    A -->|Docker Compose Generator| D["docker-compose.prod.yml"]
    
    subgraph Observability
        B --> E["Azure Log Analytics & Application Insights"]
        C --> F["Prometheus + Grafana + OpenTelemetry Collector"]
    end
```

---

## 📦 2. Production Service Defaults (`CleanArch.ServiceDefaults`)

In this repository, all services reference `CleanArch.ServiceDefaults` to ensure uniform cloud-readiness:

1. **Health Checks**:
   - `/alive`: Liveness probe (checks if the process is running).
   - `/health`: Readiness probe (checks if database and external dependencies are reachable).
2. **OpenTelemetry Telemetry**:
   - Automatic export of traces, metrics, and logs to OTLP endpoints (`OTEL_EXPORTER_OTLP_ENDPOINT`).
3. **Resilience & Service Discovery**:
   - Integrated Polly exponential backoffs and circuit breakers on outgoing `HttpClient` calls.

---

## ☁️ 3. Deploying to Azure Container Apps with `azd` (Azure Developer CLI)

The fastest and most idiomatic way to deploy an Aspire solution to Azure is with the official `azd` CLI.

### Step 1: Install `azd` CLI

- **Windows (winget)**:

  ```powershell
  winget install microsoft.azd
  ```

- **macOS / Linux**:

  ```bash
  curl -fsSL https://aka.ms/install-azd.sh | bash
  ```

### Step 2: Initialize Azure Developer Environment

In the root directory of your solution:

```bash
azd init
```

`azd` detects the `.slnx` solution and `CleanArch.AppHost`, automatically configuring the project as an Aspire deployment.

### Step 3: Login and Provision Cloud Infrastructure

```bash
azd auth login
azd up
```

### What `azd` Provisions Automatically:

1. **Azure Resource Group**: Encapsulates all project infrastructure.
2. **Azure Container Registry (ACR)**: Builds and hosts production Docker images.
3. **Azure Container Apps Environment**: Serverless Kubernetes abstraction with built-in Envoy ingress.
4. **Log Analytics Workspace & Application Insights**: Gathers all OpenTelemetry logs and distributed traces.
5. **Managed Identities & Role Assignments**: Eliminates hardcoded cloud credentials.

---

## ☸️ 4. Deploying to Kubernetes with Aspirate

If your target is **Amazon EKS**, **Google GKE**, or an on-premise Kubernetes cluster, use **Aspirate** (`aspirate`), an open-source CLI that converts .NET Aspire graphs into standard Helm charts and K8s manifests.

### Step 1: Install Aspirate

```bash
dotnet tool install -g aspirate
```

### Step 2: Generate Kubernetes Manifests

```bash
cd src/CleanArch.AppHost
aspirate generate --output-format kustomize
```

### Step 3: Apply to Cluster

```bash
kubectl apply -k ./aspirate-output/kustomize
```

---

## 📊 5. Environment Variables in Cloud Containers

When deploying to Azure Container Apps or Kubernetes, configure connection strings and secrets via container environment variables:

| Aspire Setting | Cloud Environment Variable | Note |
| :--- | :--- | :--- |
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings__DefaultConnection` | Double underscore replaces `:` in Linux |
| `Jwt:SecretKey` | `Jwt__SecretKey` | Stored as a Secret in Azure Key Vault / K8s Secret |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4317` | Directs metrics to OpenTelemetry Collector |
