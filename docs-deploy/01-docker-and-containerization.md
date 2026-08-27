# Module 01: Docker & Containerization for .NET 10 & React 19

Containerization ensures that your application runs identically in development, staging, and production environments. This module walks through production-grade Dockerfiles for both the **.NET 10 Web API** and the **React 19 Vite SPA**, followed by a unified multi-container **Docker Compose** configuration.

---

## 🏗️ 1. Multi-Stage Dockerfile for .NET 10 Web API

A production Dockerfile should:

1. **Leverage Multi-Stage Builds**: Keep the final image minimal by separating the heavy SDK (build tools) from the lightweight runtime.
2. **Optimize Docker Layer Caching**: Copy `.csproj` files and run `dotnet restore` before copying the entire source code.
3. **Run as a Non-Root User**: Protect against container breakout vulnerabilities using `USER app`.
4. **Target .NET 10 Alpine / Chiseled Images**: Keep the image footprint small and secure.

Create `src/CleanArch.WebApi/Dockerfile`:

```dockerfile
# ==============================================================================
# Stage 1: Base Runtime Image (Lightweight)
# ==============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# ==============================================================================
# Stage 2: Build & Restore Dependencies (Uses Full SDK)
# ==============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy Directory.Build.props to preserve solution-wide compiler & version settings
COPY ["Directory.Build.props", "./"]

# Copy project files for layer caching
COPY ["src/CleanArch.WebApi/CleanArch.WebApi.csproj", "src/CleanArch.WebApi/"]
COPY ["src/CleanArch.Application/CleanArch.Application.csproj", "src/CleanArch.Application/"]
COPY ["src/CleanArch.Domain/CleanArch.Domain.csproj", "src/CleanArch.Domain/"]
COPY ["src/CleanArch.Infrastructure/CleanArch.Infrastructure.csproj", "src/CleanArch.Infrastructure/"]
COPY ["src/CleanArch.ServiceDefaults/CleanArch.ServiceDefaults.csproj", "src/CleanArch.ServiceDefaults/"]

# Restore NuGet packages
RUN dotnet restore "src/CleanArch.WebApi/CleanArch.WebApi.csproj"

# Copy all source files and build
COPY . .
WORKDIR "/src/src/CleanArch.WebApi"
RUN dotnet build "CleanArch.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/build --no-restore

# ==============================================================================
# Stage 3: Publish Executable & Static Assets
# ==============================================================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "CleanArch.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false --no-restore

# ==============================================================================
# Stage 4: Final Production Image
# ==============================================================================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables for production
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

ENTRYPOINT ["dotnet", "CleanArch.WebApi.dll"]
```

### `.dockerignore` for .NET

Place `.dockerignore` in the root of the repository to prevent copying cache, local databases, and temporary build outputs into the container build context:

```dockerignore
**/.git
**/.vs
**/.vscode
**/bin
**/obj
**/logs
**/*.db
**/*.db-journal
**/node_modules
**/dist
**/.env*
```

---

## ⚛️ 2. Multi-Stage Dockerfile for React 19 + Vite Frontend

The React client produces static HTML, JavaScript, and CSS files. In production, we build the bundle with Node.js and serve it through an ultra-fast **Nginx Alpine** web server.

Create `client/Dockerfile`:

```dockerfile
# ==============================================================================
# Stage 1: Build Frontend Assets with Node 22 Alpine
# ==============================================================================
FROM node:22-alpine AS build
WORKDIR /app

# Copy package manifests first for optimal npm layer caching
COPY client/package.json client/package-lock.json* ./
RUN npm ci

# Copy client source code and build production bundle
COPY client/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Serve Static Assets with Nginx Alpine
# ==============================================================================
FROM nginx:alpine AS final

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built bundle from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `client/nginx.conf` (ensures Single Page Application routing works on reload):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA Fallback: Route all non-file requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # Disable caching for index.html (so new releases load immediately)
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

---

## 🐳 3. Full-Stack Orchestration with Docker Compose

A complete local or single-server production stack with:

- **`db`**: PostgreSQL 16 (or SQLite persistent volume)
- **`backend`**: CleanArch.WebApi (.NET 10)
- **`frontend`**: React 19 Client (Nginx)

Create `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  # Database Service
  postgres-db:
    image: postgres:16-alpine
    container_name: cleanarch_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: clean_user
      POSTGRES_PASSWORD: clean_secure_password_2026
      POSTGRES_DB: clean_identity_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clean_user -d clean_identity_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - cleanarch_net

  # .NET 10 Web API Backend
  api:
    build:
      context: .
      dockerfile: src/CleanArch.WebApi/Dockerfile
    container_name: cleanarch_api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=postgres-db;Port=5432;Database=clean_identity_db;Username=clean_user;Password=clean_secure_password_2026
      - Jwt__SecretKey=Super_Secret_Production_JWT_Key_2026_DotNet10_Must_Be_64_Chars_Long!
      - Jwt__Issuer=CleanArchAPI
      - Jwt__Audience=CleanArchClient
    depends_on:
      postgres-db:
        condition: service_healthy
    networks:
      - cleanarch_net

  # React 19 Frontend SPA
  client:
    build:
      context: .
      dockerfile: client/Dockerfile
    container_name: cleanarch_client
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - cleanarch_net

volumes:
  postgres_data:
    driver: local

networks:
  cleanarch_net:
    driver: bridge
```

---

## ⚡ 4. Docker CLI Mastery for Everyday Deployment

| Task | Command | Description |
| :--- | :--- | :--- |
| **Build & Run** | `docker compose up -d --build` | Builds images in parallel and starts in background. |
| **Check Logs** | `docker compose logs -f api` | Tails live logs from the backend API container. |
| **List Status** | `docker compose ps` | Displays container health, uptime, and port mappings. |
| **Stop All** | `docker compose down` | Stops and removes containers while preserving volumes. |
| **Clean Prune** | `docker system prune -af --volumes` | Removes unused images, containers, and dangling layers. |
