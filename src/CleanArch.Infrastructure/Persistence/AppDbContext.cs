using CleanArch.Application.Common.Interfaces;
using CleanArch.Domain.Entities;
using CleanArch.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>, IAppDbContext
{
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<IdempotentRecord> IdempotentRequests => Set<IdempotentRecord>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<PaymentRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Currency).HasMaxLength(3);
            entity.Property(e => e.OrderReference).HasMaxLength(128);
        });

        builder.Entity<IdempotentRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.IdempotencyKey, e.UserId }).IsUnique();
            entity.Property(e => e.IdempotencyKey).IsRequired().HasMaxLength(128);
            entity.Property(e => e.RequestPath).IsRequired().HasMaxLength(256);
            entity.Property(e => e.RequestHash).IsRequired().HasMaxLength(128);
        });
    }
}
