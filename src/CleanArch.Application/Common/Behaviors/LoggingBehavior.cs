using CleanArch.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CleanArch.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUser;

    public LoggingBehavior(
        ILogger<LoggingBehavior<TRequest, TResponse>> logger,
        ICurrentUserService currentUser)
    {
        _logger = logger;
        _currentUser = currentUser;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUser.UserId ?? "Anonymous";
        var userName = _currentUser.UserName ?? "Anonymous";

        _logger.LogInformation(
            "▶ [Handling Command/Query] {RequestName} | User: {UserId} ({UserName})",
            requestName, userId, userName);

        var response = await next();

        _logger.LogInformation(
            "✔ [Handled Command/Query] {RequestName} | User: {UserId} completed successfully",
            requestName, userId);

        return response;
    }
}
