using System.Security.Claims;
using CleanArch.Application.Common.Models;
using CleanArch.Application.Features.Auth.Commands.GrantPermission;
using CleanArch.Application.Features.Auth.Commands.Login;
using CleanArch.Application.Features.Auth.Commands.RefreshToken;
using CleanArch.Application.Features.Auth.Commands.Register;
using CleanArch.Application.Features.Auth.Commands.RevokeToken;
using CleanArch.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CleanArch.WebApi.Controllers;

public class AuthController : ApiControllerBase
{
    /// <summary>
    /// Register a new user via MediatR RegisterCommand.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Log in via MediatR LoginCommand and receive JWT access token and refresh token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : Unauthorized(result);
    }

    /// <summary>
    /// Refresh access token using single-use Refresh Token Rotation via MediatR.
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(Result<AuthResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Invalidate refresh token for currently authenticated user.
    /// </summary>
    [Authorize]
    [HttpPost("revoke-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeToken()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return BadRequest("User email not found in token.");

        var result = await Mediator.Send(new RevokeTokenCommand(email));
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Grant granular dynamic permissions to a user (Admin-only).
    /// </summary>
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost("grant-permission")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GrantPermission([FromBody] GrantPermissionCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
