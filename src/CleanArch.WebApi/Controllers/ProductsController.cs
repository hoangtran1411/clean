using CleanArch.Application.Features.Products.Commands.CreateProduct;
using CleanArch.Application.Features.Products.Queries.GetCachedProducts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace CleanArch.WebApi.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IOutputCacheStore _outputCacheStore;

    public ProductsController(IOutputCacheStore outputCacheStore)
    {
        _outputCacheStore = outputCacheStore;
    }

    /// <summary>
    /// Demonstrates IN-MEMORY CACHE (IMemoryCache in Application Layer).
    /// Caches C# objects in RAM with 5-minute absolute and 1-minute sliding expiration.
    /// </summary>
    [HttpGet("in-memory-cached")]
    public async Task<IActionResult> GetInMemoryCached([FromQuery] string? category)
    {
        var result = await Mediator.Send(new GetCachedProductsQuery(category));
        return Ok(new
        {
            cacheMechanism = "IMemoryCache (Application/Data Layer)",
            queriedAtUtc = DateTime.UtcNow,
            data = result.Data
        });
    }

    /// <summary>
    /// Demonstrates OUTPUT CACHE ([OutputCache] in Middleware Layer).
    /// Caches the entire HTTP response (headers, status code, JSON body) on the server.
    /// Tagged with 'products-tag' for instant bulk invalidation.
    /// </summary>
    [HttpGet("output-cached")]
    [OutputCache(Duration = 60, Tags = ["products-tag"])]
    public async Task<IActionResult> GetOutputCached()
    {
        var result = await Mediator.Send(new GetCachedProductsQuery());
        return Ok(new
        {
            cacheMechanism = "OutputCache Middleware (Server-Side HTTP Response Cache)",
            generatedAtUtc = DateTime.UtcNow,
            data = result.Data
        });
    }

    /// <summary>
    /// Demonstrates OUTPUT CACHE with VaryByRouteValue.
    /// Caches independent HTTP responses for each distinct {category} route parameter.
    /// </summary>
    [HttpGet("category/{category}")]
    [OutputCache(Duration = 60, VaryByRouteValueNames = ["category"], Tags = ["products-tag"])]
    public async Task<IActionResult> GetByCategory(string category)
    {
        var result = await Mediator.Send(new GetCachedProductsQuery(category));
        return Ok(new
        {
            cacheMechanism = $"OutputCache (VaryByRoute: {category})",
            generatedAtUtc = DateTime.UtcNow,
            category,
            data = result.Data
        });
    }

    /// <summary>
    /// Creates a new product and INVALIDATES both:
    /// 1. In-Memory Cache (via MediatR Command Handler).
    /// 2. Output Cache (via IOutputCacheStore.EvictByTagAsync).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var result = await Mediator.Send(command);
        if (!result.Succeeded)
            return BadRequest(result);

        // Tag-based Output Cache Invalidation: Evict all endpoints tagged with "products-tag"
        await _outputCacheStore.EvictByTagAsync("products-tag", HttpContext.RequestAborted);

        return CreatedAtAction(nameof(GetOutputCached), new { id = result.Data?.Id }, new
        {
            message = "Product created successfully. In-Memory cache and OutputCache ('products-tag') were evicted!",
            product = result.Data
        });
    }
}
