using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Products.DTOs;
using CleanArch.Application.Features.Products.Queries.GetCachedProducts;
using CleanArch.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace CleanArch.Application.Features.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string Category,
    decimal Price,
    int StockQuantity) : IRequest<Result<ProductDto>>;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IAppDbContext _context;
    private readonly IMemoryCache _memoryCache;

    public CreateProductCommandHandler(IAppDbContext context, IMemoryCache memoryCache)
    {
        _context = context;
        _memoryCache = memoryCache;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new ProductItem
        {
            Name = request.Name,
            Category = request.Category,
            Price = request.Price,
            StockQuantity = request.StockQuantity
        };

        await _context.Products.AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Invalidate In-Memory cache keys so fresh data is fetched on next query
        _memoryCache.Remove($"{GetCachedProductsQueryHandler.ProductsCacheKeyPrefix}all");
        _memoryCache.Remove($"{GetCachedProductsQueryHandler.ProductsCacheKeyPrefix}{request.Category.ToLowerInvariant()}");

        var dto = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Category = product.Category,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            CreatedAtUtc = product.CreatedAtUtc
        };

        return Result<ProductDto>.Success(dto, "Product created successfully and In-Memory cache invalidated.");
    }
}
