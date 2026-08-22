using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace CleanArch.Application.Features.Auth.Commands.GrantPermission;

public record GrantPermissionCommand(string Email, string Permission) : IRequest<Result>;

public class GrantPermissionCommandValidator : AbstractValidator<GrantPermissionCommand>
{
    public GrantPermissionCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Permission).NotEmpty();
    }
}

public class GrantPermissionCommandHandler : IRequestHandler<GrantPermissionCommand, Result>
{
    private readonly IAuthService _authService;

    public GrantPermissionCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result> Handle(GrantPermissionCommand request, CancellationToken cancellationToken)
    {
        var succeeded = await _authService.GrantPermissionAsync(request.Email, request.Permission);
        if (!succeeded)
        {
            return Result.Failure($"Failed to grant permission '{request.Permission}' to '{request.Email}'.");
        }

        return Result.Success($"Permission '{request.Permission}' granted to '{request.Email}' successfully.");
    }
}
