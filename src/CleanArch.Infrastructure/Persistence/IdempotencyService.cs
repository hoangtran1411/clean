using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CleanArch.Infrastructure.Persistence;

public class IdempotencyService : IIdempotencyService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<IdempotencyService> _logger;

    public IdempotencyService(AppDbContext dbContext, ILogger<IdempotencyService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<IdempotencyCheckResult> CheckAsync(
        string key,
        string? userId,
        string requestPath,
        string requestHash)
    {
        var record = await _dbContext.IdempotentRequests
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key && r.UserId == userId);

        if (record == null)
        {
            // Atomically create an in-flight pending record (StatusCode = 0) with a 2-minute lock timeout
            var pendingRecord = new IdempotentRecord
            {
                IdempotencyKey = key,
                UserId = userId,
                RequestPath = requestPath,
                RequestHash = requestHash,
                StatusCode = 0,
                ResponseBody = string.Empty,
                ContentType = "application/json",
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(2)
            };

            try
            {
                await _dbContext.IdempotentRequests.AddAsync(pendingRecord);
                await _dbContext.SaveChangesAsync();
                return new IdempotencyCheckResult { Status = IdempotencyStatus.New };
            }
            catch (DbUpdateException)
            {
                _dbContext.Entry(pendingRecord).State = EntityState.Detached;
                record = await _dbContext.IdempotentRequests
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.IdempotencyKey == key && r.UserId == userId);

                if (record == null)
                {
                    return new IdempotencyCheckResult { Status = IdempotencyStatus.New };
                }
            }
        }

        if (record.ExpiresAtUtc <= DateTime.UtcNow)
        {
            // Record expired: reset to pending for this new request
            record.RequestPath = requestPath;
            record.RequestHash = requestHash;
            record.StatusCode = 0;
            record.ResponseBody = string.Empty;
            record.ContentType = "application/json";
            record.ExpiresAtUtc = DateTime.UtcNow.AddMinutes(2);
            await _dbContext.SaveChangesAsync();

            return new IdempotencyCheckResult { Status = IdempotencyStatus.New };
        }

        if (!string.Equals(record.RequestHash, requestHash, StringComparison.Ordinal))
        {
            _logger.LogWarning("Idempotency key {Key} was previously used with a different request payload!", key);
            return new IdempotencyCheckResult { Status = IdempotencyStatus.PayloadMismatch };
        }

        if (record.StatusCode == 0)
        {
            _logger.LogInformation("Idempotency key {Key} is currently in-flight", key);
            return new IdempotencyCheckResult { Status = IdempotencyStatus.InProgress };
        }

        _logger.LogInformation("Idempotency cache hit for key: {Key}", key);

        return new IdempotencyCheckResult
        {
            Status = IdempotencyStatus.CachedHit,
            CachedStatusCode = record.StatusCode,
            CachedResponseBody = record.ResponseBody,
            CachedContentType = record.ContentType
        };
    }

    public async Task SaveResponseAsync(
        string key,
        string? userId,
        string requestPath,
        string requestHash,
        int statusCode,
        string responseBody,
        string? contentType,
        TimeSpan ttl)
    {
        var existing = await _dbContext.IdempotentRequests
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key && r.UserId == userId);

        if (existing != null)
        {
            existing.StatusCode = statusCode;
            existing.ResponseBody = responseBody;
            existing.ContentType = contentType;
            existing.ExpiresAtUtc = DateTime.UtcNow.Add(ttl);
        }
        else
        {
            var record = new IdempotentRecord
            {
                IdempotencyKey = key,
                UserId = userId,
                RequestPath = requestPath,
                RequestHash = requestHash,
                StatusCode = statusCode,
                ResponseBody = responseBody,
                ContentType = contentType ?? "application/json",
                ExpiresAtUtc = DateTime.UtcNow.Add(ttl)
            };

            await _dbContext.IdempotentRequests.AddAsync(record);
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task ReleasePendingAsync(string key, string? userId)
    {
        var record = await _dbContext.IdempotentRequests
            .FirstOrDefaultAsync(r => r.IdempotencyKey == key && r.UserId == userId && r.StatusCode == 0);

        if (record != null)
        {
            _dbContext.IdempotentRequests.Remove(record);
            await _dbContext.SaveChangesAsync();
        }
    }
}
