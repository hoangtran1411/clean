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
            return new IdempotencyCheckResult { Status = IdempotencyStatus.New };
        }

        if (record.ExpiresAtUtc <= DateTime.UtcNow)
        {
            _dbContext.IdempotentRequests.Remove(record);
            await _dbContext.SaveChangesAsync();
            return new IdempotencyCheckResult { Status = IdempotencyStatus.New };
        }

        if (!string.Equals(record.RequestHash, requestHash, StringComparison.Ordinal))
        {
            _logger.LogWarning("Idempotency key {Key} was previously used with a different request payload!", key);
            return new IdempotencyCheckResult { Status = IdempotencyStatus.PayloadMismatch };
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
}
