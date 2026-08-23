using CleanArch.Application;
using CleanArch.Domain.Constants;
using CleanArch.Infrastructure;
using CleanArch.Infrastructure.Persistence;
using CleanArch.ServiceDefaults;
using CleanArch.WebApi.Authorization;
using CleanArch.WebApi.Middleware;
using Microsoft.AspNetCore.Authorization;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. .NET Aspire Service Defaults (OpenTelemetry, HealthChecks, Resilience, Service Discovery)
builder.AddServiceDefaults();

// 2. Clean Architecture Layer Registrations
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. In-Memory Caching (Application Layer) & Output Caching (Middleware Layer)
builder.Services.AddMemoryCache();
builder.Services.AddOutputCache(options =>
{
    // Global base policy: Cache GET requests
    options.AddBasePolicy(builder => builder.Cache());
});

// 4. Dynamic Authorization Policy Provider & Handler
builder.Services.AddSingleton<IAuthorizationPolicyProvider, DynamicPermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminOrManager", policy =>
        policy.RequireRole(UserRoles.Admin, UserRoles.Manager));

// 5. Global Exception Handling & RFC 7807/9457 ProblemDetails (.NET 10)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 6. Controllers & Modern OpenAPI (Scalar)
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Aspire Default Endpoints (/health, /alive)
app.MapDefaultEndpoints();

// Seed Database automatically on startup
await DbInitializer.SeedRolesAndUsersAsync(app.Services);

// Built-in .NET 10 Global Exception Handler Middleware
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Clean Architecture Identity & JWT API (.NET 10)")
               .WithTheme(ScalarTheme.Moon);
    });
}

app.UseHttpsRedirection();

// Output Caching Middleware (serves cached HTTP responses before reaching controllers)
app.UseOutputCache();

// IMPORTANT: Authentication must precede Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
