using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArch.Application.Features.Products.Queries.ExportProducts;

public record ExportProductsQuery(string? Category = null) : IRequest<byte[]>;

public class ExportProductsQueryHandler : IRequestHandler<ExportProductsQuery, byte[]>
{
    private readonly IAppDbContext _context;
    private readonly IExcelService _excelService;

    public ExportProductsQueryHandler(IAppDbContext context, IExcelService excelService)
    {
        _context = context;
        _excelService = excelService;
    }

    public async Task<byte[]> Handle(ExportProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            var targetCategory = request.Category.Trim();
            query = query.Where(p => p.Category == targetCategory);
        }

        var products = await query
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

        return _excelService.ExportProductsToExcel(products);
    }
}
