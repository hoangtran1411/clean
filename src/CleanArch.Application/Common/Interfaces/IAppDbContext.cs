using CleanArch.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<ProductItem> Products { get; }
    DbSet<PaymentRecord> Payments { get; }
    DbSet<IdempotentRecord> IdempotentRequests { get; }
    DbSet<WorkflowTemplate> WorkflowTemplates { get; }
    DbSet<WorkflowApprovalLevel> WorkflowApprovalLevels { get; }
    DbSet<WorkflowRequest> WorkflowRequests { get; }
    DbSet<WorkflowApprovalAction> WorkflowApprovalActions { get; }
    DbSet<WorkflowHistory> WorkflowHistories { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
