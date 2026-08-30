using CleanArch.Application;
using CleanArch.Domain.Constants;
using CleanArch.Infrastructure;
using CleanArch.Infrastructure.Persistence;
using CleanArch.ServiceDefaults;
using CleanArch.WebApi.Authorization;
using CleanArch.WebApi.Middleware;
using Microsoft.AspNetCore.Authorization;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Structured Logging with Serilog (Console + Rolling File Sinks)
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext());

// 2. .NET Aspire Service Defaults (OpenTelemetry, HealthChecks, Resilience, Service Discovery)
builder.AddServiceDefaults();

// 3. Clean Architecture Layer Registrations
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 4. In-Memory Caching (Application Layer) & Output Caching (Middleware Layer)
builder.Services.AddMemoryCache();
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(b => b.Cache());
});

// 5. Dynamic Authorization Policy Provider & Handler
builder.Services.AddSingleton<IAuthorizationPolicyProvider, DynamicPermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminOrManager", policy =>
        policy.RequireRole(UserRoles.Admin, UserRoles.Manager));

// 6. Global Exception Handling & RFC 7807/9457 ProblemDetails (.NET 10)
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// 7. Controllers & Modern OpenAPI (Scalar)
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 8. CORS Configuration for Frontend Single-Page App (React 19)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Correlation ID Middleware (must be first to tag all incoming logs with X-Correlation-ID)
app.UseMiddleware<CorrelationIdMiddleware>();

// Serilog HTTP Request Logging (logs every HTTP request with status, duration, and endpoint)
app.UseSerilogRequestLogging();

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

// CORS Middleware must precede Authentication
app.UseCors();

// Output Caching Middleware
app.UseOutputCache();

// IMPORTANT: Authentication must precede Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
