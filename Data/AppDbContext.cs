using IdentityJwtDemo.Idempotency;
using IdentityJwtDemo.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityJwtDemo.Data;

/// <summary>
/// AppDbContext inherits from IdentityDbContext to manage Identity tables and Idempotency records.
/// </summary>
public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<IdempotentRequestRecord> IdempotentRequests { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // MUST call base.OnModelCreating to configure Identity table schemas
        base.OnModelCreating(builder);

        builder.Entity<IdempotentRequestRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.IdempotencyKey, e.UserId }).IsUnique();
            entity.Property(e => e.IdempotencyKey).IsRequired().HasMaxLength(128);
            entity.Property(e => e.RequestPath).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RequestHash).IsRequired().HasMaxLength(128);
        });
    }
}
