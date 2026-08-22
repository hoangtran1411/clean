using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace CleanArch.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<AuthResponse>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var response = await _authService.LoginAsync(request.Email, request.Password);
        if (!response.IsSuccess)
        {
            return Result<AuthResponse>.Failure(response.Message);
        }

        return Result<AuthResponse>.Success(response, "Login successful.");
    }
}
