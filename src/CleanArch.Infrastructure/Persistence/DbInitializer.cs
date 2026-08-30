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
        const string adminPassword = "Admin@123456";
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

            var result = await userManager.CreateAsync(newAdmin, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newAdmin, UserRoles.Admin);
                foreach (var perm in AppPermissions.AllPermissions)
                {
                    await userManager.AddClaimAsync(newAdmin, new Claim(AppPermissions.ClaimType, perm));
                }
            }
        }
        else
        {
            // Ensure password is synchronized with quick test credentials
            if (!await userManager.CheckPasswordAsync(adminUser, adminPassword))
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                await userManager.ResetPasswordAsync(adminUser, token, adminPassword);
            }

            // Sync all permissions
            var existingClaims = await userManager.GetClaimsAsync(adminUser);
            foreach (var perm in AppPermissions.AllPermissions)
            {
                if (!existingClaims.Any(c => c.Type == AppPermissions.ClaimType && c.Value == perm))
                {
                    await userManager.AddClaimAsync(adminUser, new Claim(AppPermissions.ClaimType, perm));
                }
            }
        }

        // 3. Seed Manager
        const string managerEmail = "manager@example.com";
        const string managerPassword = "Manager@123456";
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

            var result = await userManager.CreateAsync(newManager, managerPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newManager, UserRoles.Manager);
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsExport));
            }
        }
        else
        {
            if (!await userManager.CheckPasswordAsync(managerUser, managerPassword))
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(managerUser);
                await userManager.ResetPasswordAsync(managerUser, token, managerPassword);
            }
        }

        // 4. Seed Standard User
        const string standardEmail = "user@example.com";
        const string standardPassword = "User@123456";
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

            var result = await userManager.CreateAsync(newStandard, standardPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newStandard, UserRoles.User);
                await userManager.AddClaimAsync(newStandard, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
            }
        }
        else
        {
            if (!await userManager.CheckPasswordAsync(standardUser, standardPassword))
            {
                var token = await userManager.GeneratePasswordResetTokenAsync(standardUser);
                await userManager.ResetPasswordAsync(standardUser, token, standardPassword);
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
