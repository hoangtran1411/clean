using CleanArch.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<PaymentRecord> Payments { get; }
    DbSet<IdempotentRecord> IdempotentRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
