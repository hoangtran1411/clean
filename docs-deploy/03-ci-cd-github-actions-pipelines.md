# Module 03: CI/CD Pipelines with GitHub Actions

Continuous Integration (CI) and Continuous Deployment (CD) automate the validation, testing, containerization, and deployment of your code on every pull request and production release.

This module walks through the real-world, production-ready CI/CD pipelines configured in this repository for the **.NET 10 (Clean Architecture)** backend and the **React 19 (Vite + Tailwind v4)** frontend.

---

## 🔄 1. The CI/CD Lifecycle Architecture

In our enterprise stack, code progression from local commit to production deployment follows a strict automated pipeline:

```mermaid
flowchart TD
    A[Developer Pushes to main / PR] --> B[CI Pipeline (.github/workflows/ci.yml)]
    
    subgraph CI Pipeline
        B --> M[Job 1: Markdown Lint & Docs Verification]
        M --> C[Job 2: Backend CI .NET 10]
        M --> D[Job 3: Frontend CI React 19]
        
        subgraph Backend Validation
            C --> C1[Setup .NET 10 SDK & NuGet Cache]
            C1 --> C2[Restore IdentityCleanArch.slnx]
            C2 --> C3[Compile Solution in Release Mode]
            C3 --> C4[Execute 42 xUnit Tests & Code Coverage]
            C4 --> C5[Upload TestResults Artifact]
        end
        
        subgraph Frontend Validation
            D --> D1[Setup Node.js 22 & npm Cache]
            D1 --> D2[npm ci Clean Dependency Install]
            D2 --> D3[tsc TypeCheck & Vite Production Build]
            D3 --> D4[Upload client/dist Artifact]
        end
    end
    
    C4 & D3 --> G{Branch == main or Git Tag?}
    G -- No --> I[Report PR Checks Pass on GitHub]
    G -- Yes --> H[CD Pipeline (.github/workflows/cd.yml)]
    
    subgraph CD Pipeline
        H --> J1[Build Backend Docker Image]
        H --> J2[Build Frontend Nginx Docker Image]
        J1 & J2 --> K[Push Images to GHCR Registry]
        K --> L[Deploy Containers to Cloud / VPS]
        L --> Smoke[Health Probes /health & /alive]
    end
```

---

## 🧪 2. Continuous Integration Workflow ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml))

Our active CI pipeline automatically validates all code against quality gates, runs tests, and enforces formatting across branches `main` and `develop`.

### Complete Active Configuration

```yaml
name: CI - Build, Lint & Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true

jobs:
  # ==============================================================================
  # Job 1: Markdown Linting & Docs Quality
  # ==============================================================================
  markdown-lint:
    name: Markdown Lint & Docs Verification
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run Markdownlint
        run: npx markdownlint-cli "**/*.md" --ignore node_modules --ignore client/node_modules --ignore client/dist

  # ==============================================================================
  # Job 2: .NET 10 Backend Build & Test Suite
  # ==============================================================================
  backend-ci:
    name: Backend CI (.NET 10 & xUnit)
    runs-on: ubuntu-latest
    needs: [markdown-lint]
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup .NET 10 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Cache NuGet Packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj', 'Directory.Build.props') }}
          restore-keys: |
            ${{ runner.os }}-nuget-

      - name: Restore Dependencies
        run: dotnet restore IdentityCleanArch.slnx

      - name: Build Solution (Release)
        run: dotnet build IdentityCleanArch.slnx --configuration Release --no-restore

      - name: Run Unit & Integration Tests
        run: >
          dotnet test IdentityCleanArch.slnx 
          --configuration Release 
          --no-build 
          --verbosity normal 
          --collect:"XPlat Code Coverage" 
          --results-directory ./TestResults

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backend-test-results
          path: ./TestResults
          retention-days: 7

  # ==============================================================================
  # Job 3: React 19 Frontend TypeCheck & Build
  # ==============================================================================
  frontend-ci:
    name: Frontend CI (React 19 & Vite)
    runs-on: ubuntu-latest
    needs: [markdown-lint]
    defaults:
      run:
        working-directory: ./client
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install Client Dependencies
        run: npm ci

      - name: TypeScript Check & Vite Production Build
        run: npm run build

      - name: Upload Client Dist Artifact
        uses: actions/upload-artifact@v4
        with:
          name: client-production-dist
          path: client/dist
          retention-days: 7
```

---

## 🚀 3. Continuous Deployment Workflow ([`.github/workflows/cd.yml`](../.github/workflows/cd.yml))

The CD workflow triggers on commits to `main`, semver release tags (`v*.*.*`), or manual execution via `workflow_dispatch`. It builds multi-stage Docker images and publishes them to **GitHub Container Registry (GHCR)**.

### Complete Active Configuration

```yaml
name: CD - Build & Publish Docker Containers

on:
  push:
    branches: [ main ]
    tags: [ 'v*.*.*' ]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
  REGISTRY: ghcr.io
  BACKEND_IMAGE_NAME: ${{ github.repository }}/backend
  FRONTEND_IMAGE_NAME: ${{ github.repository }}/frontend

jobs:
  # ==============================================================================
  # Job 1: Build and Publish Backend Docker Image
  # ==============================================================================
  publish-backend:
    name: Build & Push Backend Container
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata for Backend
        id: meta-backend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE_NAME }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=semver,pattern={{version}}
            type=sha,format=short

      - name: Build and Push Backend Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: src/CleanArch.WebApi/Dockerfile
          push: true
          tags: ${{ steps.meta-backend.outputs.tags }}
          labels: ${{ steps.meta-backend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ==============================================================================
  # Job 2: Build and Publish Frontend Docker Image
  # ==============================================================================
  publish-frontend:
    name: Build & Push Frontend Container
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata for Frontend
        id: meta-frontend
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE_NAME }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=semver,pattern={{version}}
            type=sha,format=short

      - name: Build and Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: ./client
          file: client/Dockerfile
          push: true
          tags: ${{ steps.meta-frontend.outputs.tags }}
          labels: ${{ steps.meta-frontend.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 🔑 4. Key Architectural Optimizations in Our Pipelines

### 1. Zero-Warning Node.js 24 Execution

GitHub Actions runners deprecated the Node 20 runtime. We set:

```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

This ensures all JavaScript actions run smoothly on Node 24 without triggering deprecation warnings or runner annotations.

### 2. High-Performance NuGet Caching

NuGet dependencies are cached using a composite hash of all `.csproj` files and `Directory.Build.props`:

```yaml
key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj', 'Directory.Build.props') }}
```

This reduces backend build times on subsequent runs from ~45 seconds to under 8 seconds.

### 3. Concurrency Control & Run Cancellation

For pull requests, obsolete runs are automatically cancelled when a developer pushes new commits, saving GitHub Actions compute minutes:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 4. GitHub Actions Docker Layer Caching (`type=gha`)

Our container publishing jobs use Buildx GitHub Actions cache (`cache-from: type=gha`, `cache-to: type=gha,mode=max`). Only modified layers are rebuilt during image packaging.

---

## 🐳 5. Unified Local Orchestration ([`docker-compose.yml`](../docker-compose.yml))

To run the exact containers produced by CI/CD locally:

```bash
docker compose up --build
```

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: src/CleanArch.WebApi/Dockerfile
    container_name: cleanarch-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
      - ConnectionStrings__DefaultConnection=Data Source=/app/data/clean_identity.db
      - Jwt__SecretKey=Your_Production_Super_Secret_Key_At_Least_64_Characters_Long_For_HmacSha512!
      - Jwt__Issuer=CleanArchAPI
      - Jwt__Audience=CleanArchClient
    ports:
      - "8080:8080"
    volumes:
      - db_data:/app/data

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: cleanarch-client
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db_data:
```

---

## 🔐 6. Production Secrets & Environment Governance

When deploying to staging or production, configure the following secrets under **Settings > Secrets and variables > Actions**:

| Secret Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `PRODUCTION_JWT_SECRET` | 512-bit secure secret key for HMAC-SHA512 token signing | `SecureRandomKey64BytesLong...` |
| `PRODUCTION_DB_CONN` | Production connection string | `Data Source=/app/data/prod.db` or PostgreSQL |
| `VPS_HOST` | Target production server IP or domain | `203.0.113.50` |
| `VPS_SSH_KEY` | Deployer SSH private key for remote execution | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

> [!TIP]
> Use **GitHub Environments** (`production`) with mandatory reviewer sign-offs so production container deployments require explicit engineering approval before touching live servers.
