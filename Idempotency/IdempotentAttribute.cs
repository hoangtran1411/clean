using Microsoft.AspNetCore.Mvc.Filters;

namespace IdentityJwtDemo.Idempotency;

/// <summary>
/// Decorates an endpoint to ensure safe idempotency.
/// Requires the client to send the 'Idempotency-Key' HTTP header.
/// </summary>
[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public class IdempotentAttribute : Attribute, IFilterFactory
{
    public int ExpiresInHours { get; set; } = 24;
    public string HeaderName { get; set; } = "Idempotency-Key";

    public bool IsReusable => true;

    public IFilterMetadata CreateInstance(IServiceProvider serviceProvider)
    {
        var idempotencyService = serviceProvider.GetRequiredService<IIdempotencyService>();
        return new IdempotentActionFilter(idempotencyService, ExpiresInHours, HeaderName);
    }
}
