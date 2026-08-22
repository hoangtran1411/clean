using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace CleanArch.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string FullName,
    string Email,
    string Password,
    string ConfirmPassword) : IRequest<Result<AuthResponse>>;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100).WithMessage("Full name must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email address format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var response = await _authService.RegisterAsync(request.FullName, request.Email, request.Password);
        if (!response.IsSuccess)
        {
            return Result<AuthResponse>.Failure(response.Message);
        }

        return Result<AuthResponse>.Success(response, "User registered successfully.");
    }
}
