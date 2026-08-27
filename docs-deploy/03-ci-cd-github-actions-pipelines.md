# Module 03: CI/CD Pipelines with GitHub Actions

Continuous Integration (CI) and Continuous Deployment (CD) automate the validation, containerization, and deployment of your code on every pull request and release.

---

## 🔄 1. The CI/CD Lifecycle

```mermaid
flowchart TD
    A[Developer Pushes to main / PR] --> B[CI Pipeline]
    subgraph CI Pipeline
        B --> C[Restore & Cache Dependencies]
        C --> D[Run Linter & Format Check]
        D --> E[Compile Backend & Frontend]
        E --> F[Run Unit & Integration Tests]
    end
    F --> G{Branch == main?}
    G -- Yes --> H[CD Pipeline]
    G -- No --> I[Report PR Checks Pass]
    subgraph CD Pipeline
        H --> J[Build Docker Images]
        J --> K[Push to GHCR / Docker Hub]
        K --> L[Deploy to Production Server / Cloud]
        L --> M[Post-Deployment Smoke Test]
    end
```

---

## 🧪 2. Continuous Integration Workflow (`.github/workflows/ci.yml`)

Create `.github/workflows/ci.yml`:

```yaml
name: CI - Build, Lint & Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-validation:
    name: Validate .NET 10 Backend
    runs-on: ubuntu-latest

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

      - name: Check Code Formatting
        run: dotnet format --verify-no-changes --verbosity diagnostic

      - name: Build Solution
        run: dotnet build IdentityCleanArch.slnx --no-restore --configuration Release

      - name: Execute Tests
        run: dotnet test IdentityCleanArch.slnx --no-build --configuration Release --verbosity normal --collect:"XPlat Code Coverage"

  frontend-validation:
    name: Validate React 19 Frontend
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install Client Dependencies
        working-directory: client
        run: npm ci

      - name: Run Linter (oxlint)
        working-directory: client
        run: npm run lint

      - name: TypeScript Typecheck & Production Build
        working-directory: client
        run: npm run build
```

---

## 🚀 3. Continuous Deployment Workflow (`.github/workflows/cd.yml`)

This workflow builds Docker images, publishes them to **GitHub Container Registry (GHCR)**, and triggers a remote zero-downtime deployment over SSH.

Create `.github/workflows/cd.yml`:

```yaml
name: CD - Containerize & Deploy to Production

on:
  push:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: ghcr.io/${{ github.repository }}/backend
  FRONTEND_IMAGE: ghcr.io/${{ github.repository }}/frontend

jobs:
  publish-images:
    name: Build & Push Docker Images
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

      # Build & Push .NET 10 API
      - name: Build and Push Backend Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: src/CleanArch.WebApi/Dockerfile
          push: true
          tags: |
            ${{ env.BACKEND_IMAGE }}:latest
            ${{ env.BACKEND_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # Build & Push React 19 Client
      - name: Build and Push Frontend Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: client/Dockerfile
          push: true
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-vps:
    name: Deploy to Production VPS
    needs: publish-images
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Execute Remote SSH Deployment
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_PRIVATE_KEY }}
          script: |
            cd /opt/cleanarch
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            docker compose pull
            docker compose up -d --remove-orphans
            docker image prune -af
```

---

## 🔐 4. GitHub Secrets & Environments Governance

To securely run your CI/CD pipelines, configure the following secrets under **Settings > Secrets and variables > Actions**:

| Secret Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `VPS_HOST` | Production server public IP or FQDN | `203.0.113.45` |
| `VPS_USERNAME` | Non-root deployment user with Docker group access | `deployer` |
| `VPS_SSH_PRIVATE_KEY` | Ed25519 or RSA private SSH key for automation | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PRODUCTION_JWT_SECRET` | 256-bit+ secure random secret key | `SecureRandomHexBytes...` |
| `PRODUCTION_DB_CONN` | Production PostgreSQL connection string | `Host=...;Database=...;User Id=...;Password=...` |

> [!TIP]
> Use **GitHub Environments** (`production`) with required reviewer approvals so changes to `main` require a senior engineer's manual confirmation before touching the live server.
