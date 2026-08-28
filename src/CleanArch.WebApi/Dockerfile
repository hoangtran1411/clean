# ==============================================================================
# Stage 1: Base Runtime Image (Lightweight .NET 10 ASP.NET)
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
# Stage 4: Production Final Runtime
# ==============================================================================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CleanArch.WebApi.dll"]
