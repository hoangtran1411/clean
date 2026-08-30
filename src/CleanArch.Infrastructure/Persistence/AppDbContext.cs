using CleanArch.Application.Common.Interfaces;
using CleanArch.Domain.Entities;
using CleanArch.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser>, IAppDbContext
{
    public DbSet<ProductItem> Products => Set<ProductItem>();
    public DbSet<PaymentRecord> Payments => Set<PaymentRecord>();
    public DbSet<IdempotentRecord> IdempotentRequests => Set<IdempotentRecord>();
    public DbSet<WorkflowTemplate> WorkflowTemplates => Set<WorkflowTemplate>();
    public DbSet<WorkflowApprovalLevel> WorkflowApprovalLevels => Set<WorkflowApprovalLevel>();
    public DbSet<WorkflowRequest> WorkflowRequests => Set<WorkflowRequest>();
    public DbSet<WorkflowApprovalAction> WorkflowApprovalActions => Set<WorkflowApprovalAction>();
    
    // Stub for backward compat if it exists elsewhere
    public DbSet<WorkflowHistory> WorkflowHistories => Set<WorkflowHistory>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ProductItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Category);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100).UseCollation("NOCASE");
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });

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

        builder.Entity<WorkflowTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasMany(e => e.ApprovalLevels).WithOne(e => e.Template).HasForeignKey(e => e.WorkflowTemplateId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(e => e.Requests).WithOne(e => e.Template).HasForeignKey(e => e.WorkflowTemplateId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<WorkflowApprovalLevel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.WorkflowTemplateId, e.LevelOrder }).IsUnique();
        });

        builder.Entity<WorkflowRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.RequestedByUserId);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.HasMany(e => e.ApprovalActions).WithOne(e => e.Request).HasForeignKey(e => e.WorkflowRequestId).OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<WorkflowApprovalAction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.WorkflowRequestId);
        });

        // Seed WorkflowTemplates
        builder.Entity<WorkflowTemplate>().HasData(
            new WorkflowTemplate { Id = 1, Name = "Standard Approval (3 Levels)", Description = "TeamLeader -> DepartmentHead -> TechnicalDirector", IsActive = true },
            new WorkflowTemplate { Id = 2, Name = "Extended Approval (4 Levels)", Description = "TeamLeader -> DepartmentHead -> DeputyDirector -> TechnicalDirector", IsActive = true }
        );

        // Seed WorkflowApprovalLevels
        builder.Entity<WorkflowApprovalLevel>().HasData(
            // Template 1
            new WorkflowApprovalLevel { Id = 1, WorkflowTemplateId = 1, LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" },
            new WorkflowApprovalLevel { Id = 2, WorkflowTemplateId = 1, LevelOrder = 2, LevelName = "Department Head", RequiredPermission = "Workflows.Approve.DepartmentHead" },
            new WorkflowApprovalLevel { Id = 3, WorkflowTemplateId = 1, LevelOrder = 3, LevelName = "Technical Director", RequiredPermission = "Workflows.Approve.TechnicalDirector" },
            
            // Template 2
            new WorkflowApprovalLevel { Id = 4, WorkflowTemplateId = 2, LevelOrder = 1, LevelName = "Team Leader", RequiredPermission = "Workflows.Approve.TeamLeader" },
            new WorkflowApprovalLevel { Id = 5, WorkflowTemplateId = 2, LevelOrder = 2, LevelName = "Department Head", RequiredPermission = "Workflows.Approve.DepartmentHead" },
            new WorkflowApprovalLevel { Id = 6, WorkflowTemplateId = 2, LevelOrder = 3, LevelName = "Deputy Director", RequiredPermission = "Workflows.Approve.DeputyDirector" },
            new WorkflowApprovalLevel { Id = 7, WorkflowTemplateId = 2, LevelOrder = 4, LevelName = "Technical Director", RequiredPermission = "Workflows.Approve.TechnicalDirector" }
        );
    }
}
