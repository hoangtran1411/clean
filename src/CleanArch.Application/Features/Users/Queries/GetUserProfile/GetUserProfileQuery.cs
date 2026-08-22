using CleanArch.Application.Common.Interfaces;
using CleanArch.Application.Common.Models;
using MediatR;

namespace CleanArch.Application.Features.Users.Queries.GetUserProfile;

public record GetUserProfileQuery(string UserId) : IRequest<Result<UserProfileData>>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, Result<UserProfileData>>
{
    private readonly IAuthService _authService;

    public GetUserProfileQueryHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<Result<UserProfileData>> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var profile = await _authService.GetUserProfileAsync(request.UserId);
        if (profile == null)
        {
            return Result<UserProfileData>.Failure("User profile not found.");
        }

        return Result<UserProfileData>.Success(profile);
    }
}
