using System.Security.Claims;
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Identity;

namespace IdentityJwtDemo.Data;

public static class DbInitializer
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
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

        // 2. Seed Default Super Admin User (Full Access)
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
                // Admin gets all permission claims
                foreach (var perm in AppPermissions.AllPermissions)
                {
                    await userManager.AddClaimAsync(newAdmin, new Claim(AppPermissions.ClaimType, perm));
                }
            }
        }

        // 3. Seed Default Manager User (View + Reports Permissions)
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
                // Assign specific permissions to manager
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsView));
                await userManager.AddClaimAsync(newManager, new Claim(AppPermissions.ClaimType, AppPermissions.ReportsExport));
            }
        }

        // 4. Seed Standard User (Users.View only)
        const string standardEmail = "user@example.com";
        var standardUser = await userManager.FindByEmailAsync(standardEmail);
        if (standardUser == null)
        {
            var newStandardUser = new ApplicationUser
            {
                UserName = standardEmail,
                Email = standardEmail,
                FullName = "Standard Employee",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(newStandardUser, "User@123456");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(newStandardUser, UserRoles.User);
                await userManager.AddClaimAsync(newStandardUser, new Claim(AppPermissions.ClaimType, AppPermissions.UsersView));
            }
        }
    }
}
