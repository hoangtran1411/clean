using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using MediatR;

namespace CleanArch.Application.Features.Auth.Commands.RevokeToken;

public record RevokeTokenCommand(string Email) : IRequest<Result>;

public class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, Result>
{
    private readonly IAuthService _authService;

    public RevokeTokenCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var succeeded = await _authService.RevokeTokenAsync(request.Email);
        if (!succeeded)
        {
            return Result.Failure("Failed to revoke token. User may not exist.");
        }

        return Result.Success("Token revoked successfully.");
    }
}
