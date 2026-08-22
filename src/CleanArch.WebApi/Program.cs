using CleanArch.Application;
using CleanArch.Domain.Constants;
using CleanArch.Infrastructure;
using CleanArch.Infrastructure.Persistence;
using CleanArch.WebApi.Authorization;
using CleanArch.WebApi.Middleware;
using Microsoft.AspNetCore.Authorization;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Clean Architecture Layer Registrations
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Dynamic Authorization Policy Provider & Handler
builder.Services.AddSingleton<IAuthorizationPolicyProvider, DynamicPermissionPolicyProvider>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminOrManager", policy =>
        policy.RequireRole(UserRoles.Admin, UserRoles.Manager));

// 3. Controllers & Modern OpenAPI (Scalar)
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed Database automatically on startup
await DbInitializer.SeedRolesAndUsersAsync(app.Services);

// Custom Exception Handling Middleware (translates ValidationException -> 400 Bad Request)
app.UseMiddleware<CustomExceptionHandlerMiddleware>();

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

// IMPORTANT: Authentication must precede Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
