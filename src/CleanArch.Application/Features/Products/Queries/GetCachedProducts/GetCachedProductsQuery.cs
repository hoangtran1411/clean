using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace CleanArch.Application.Features.Products.Queries.GetCachedProducts;

public record GetCachedProductsQuery(string? Category = null) : IRequest<Result<List<ProductDto>>>;

public class GetCachedProductsQueryHandler : IRequestHandler<GetCachedProductsQuery, Result<List<ProductDto>>>
{
    private readonly IAppDbContext _context;
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<GetCachedProductsQueryHandler> _logger;

    public const string ProductsCacheKeyPrefix = "products_list_";

    public GetCachedProductsQueryHandler(
        IAppDbContext context,
        IMemoryCache memoryCache,
        ILogger<GetCachedProductsQueryHandler> logger)
    {
        _context = context;
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public async Task<Result<List<ProductDto>>> Handle(GetCachedProductsQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"{ProductsCacheKeyPrefix}{request.Category?.ToLowerInvariant() ?? "all"}";

        // In-Memory Cache using GetOrCreateAsync
        var products = await _memoryCache.GetOrCreateAsync(cacheKey, async entry =>
        {
            _logger.LogInformation("💾 [IMemoryCache MISS] Querying database for category: {Category}", request.Category ?? "ALL");

            // Configure cache entry lifetime options
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5); // Hard expiry
            entry.SlidingExpiration = TimeSpan.FromMinutes(1);               // Inactive expiry
            entry.Priority = CacheItemPriority.High;

            var query = _context.Products.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Category))
            {
                var targetCategory = request.Category.Trim();
                query = query.Where(p => p.Category == targetCategory);
            }

            return await query
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    CreatedAtUtc = p.CreatedAtUtc
                })
                .ToListAsync(cancellationToken);
        });

        return Result<List<ProductDto>>.Success(products ?? []);
    }
}
