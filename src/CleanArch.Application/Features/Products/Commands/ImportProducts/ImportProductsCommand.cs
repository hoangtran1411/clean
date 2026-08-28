using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace CleanArch.Application.Features.Products.Commands.ImportProducts;

public record ImportProductsResult
{
    public int ImportedCount { get; set; }
    public int ErrorCount { get; set; }
    public List<string> Errors { get; set; } = [];
}

public record ImportProductsCommand(Stream FileStream) : IRequest<Result<ImportProductsResult>>;

public class ImportProductsCommandHandler : IRequestHandler<ImportProductsCommand, Result<ImportProductsResult>>
{
    private readonly IAppDbContext _context;
    private readonly IExcelService _excelService;
    private readonly IMemoryCache _memoryCache;

    public ImportProductsCommandHandler(
        IAppDbContext context,
        IExcelService excelService,
        IMemoryCache memoryCache)
    {
        _context = context;
        _excelService = excelService;
        _memoryCache = memoryCache;
    }

    public async Task<Result<ImportProductsResult>> Handle(ImportProductsCommand request, CancellationToken cancellationToken)
    {
        var (validProducts, errors) = await _excelService.ImportProductsFromExcelAsync(request.FileStream, cancellationToken);

        if (validProducts.Count > 0)
        {
            await _context.Products.AddRangeAsync(validProducts, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Invalidate In-Memory caches so fresh products are visible
            _memoryCache.Remove("products_list_all");
            foreach (var category in validProducts.Select(p => p.Category.ToLowerInvariant()).Distinct())
            {
                _memoryCache.Remove($"products_list_{category}");
            }
        }

        var result = new ImportProductsResult
        {
            ImportedCount = validProducts.Count,
            ErrorCount = errors.Count,
            Errors = errors
        };

        var message = $"Successfully imported {validProducts.Count} products. {errors.Count} errors encountered.";
        return Result<ImportProductsResult>.Success(result, message);
    }
}
