using System.Diagnostics;
using CleanArch.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CleanArch.Application.Common.Behaviors;

public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly Stopwatch _timer;
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUser;

    public const int LongRunningThresholdMs = 500;

    public PerformanceBehavior(
        ILogger<PerformanceBehavior<TRequest, TResponse>> logger,
        ICurrentUserService currentUser)
    {
        _timer = new Stopwatch();
        _logger = logger;
        _currentUser = currentUser;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        _timer.Restart();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > LongRunningThresholdMs)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _currentUser.UserId ?? "Anonymous";
            var userName = _currentUser.UserName ?? "Anonymous";

            _logger.LogWarning(
                "⚠️ [LONG RUNNING REQUEST] {RequestName} took {ElapsedMilliseconds}ms (> {Threshold}ms) | User: {UserId} ({UserName})",
                requestName, elapsedMilliseconds, LongRunningThresholdMs, userId, userName);
        }

        return response;
    }
}
