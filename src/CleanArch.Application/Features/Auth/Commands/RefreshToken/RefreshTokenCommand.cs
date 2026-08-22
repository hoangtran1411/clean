using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using MediatR;

namespace CleanArch.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : IRequest<Result<AuthResponse>>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public RefreshTokenCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var response = await _authService.RefreshTokenAsync(request.AccessToken, request.RefreshToken);
        if (!response.IsSuccess)
        {
            return Result<AuthResponse>.Failure(response.Message);
        }

        return Result<AuthResponse>.Success(response, "Token refreshed successfully.");
    }
}
