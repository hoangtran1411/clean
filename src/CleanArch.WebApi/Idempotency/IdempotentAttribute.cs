using CleanArch.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CleanArch.WebApi.Idempotency;

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
