using System.Security.Claims;
using CleanArch.Domain.Constants;
using CleanArch.Domain.Entities;
using CleanArch.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CleanArch.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedRolesAndUsersAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        string[] roleNames = [UserRoles.Admin, UserRoles.Manager, UserRoles.User];
        foreach (var roleName in roleNames)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // 2. Seed Super Admin
        const string adminEmail = "admin@example.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var newAdmin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(newAdmin, "Admin@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, UserRoles.Admin);
                foreach (var perm in AppPermissions.AllPermissions)
                {
                    await userManager.AddClaimAsync(newAdmin, new Claim(AppPermissions.ClaimType, perm));
                }
            }
        }

        // 3. Seed Manager
        const string managerEmail = "manager@example.com";
        var managerUser = await userManager.FindByEmailAsync(managerEmail);
        if (managerUser == null)
        {
            var newManager = new ApplicationUser
            {
                UserName = managerEmail,
                Email = managerEmail,
                FullName = "Operations Manager",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(newManager, "Manager@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newManager, UserRoles.Manager);
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsExport));
            }
        }

        // 4. Seed Standard User
        const string standardEmail = "user@example.com";
        var standardUser = await userManager.FindByEmailAsync(standardEmail);
        if (standardUser == null)
        {
            var newStandard = new ApplicationUser
            {
                UserName = standardEmail,
                Email = standardEmail,
                FullName = "Standard Employee",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(newStandard, "User@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newStandard, UserRoles.User);
                await userManager.AddClaimAsync(newStandard, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
            }
        }

        // 5. Seed Initial Products for Caching demos
        if (!await context.Products.AnyAsync())
        {
            await context.Products.AddRangeAsync(
                new ProductItem { Name = "MacBook Pro M4 Max", Category = "Laptops", Price = 3499.99m, StockQuantity = 15 },
                new ProductItem { Name = "Dell XPS 16", Category = "Laptops", Price = 2299.00m, StockQuantity = 20 },
                new ProductItem { Name = "Sony WH-1000XM5", Category = "Audio", Price = 399.99m, StockQuantity = 50 },
                new ProductItem { Name = "Keychron Q1 Pro", Category = "Accessories", Price = 199.00m, StockQuantity = 40 }
            );
            await context.SaveChangesAsync();
        }
    }
}
