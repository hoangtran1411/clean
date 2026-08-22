using System.Security.Claims;
using IdentityJwtDemo.DTOs;
using IdentityJwtDemo.Models;
using IdentityJwtDemo.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityJwtDemo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new user account. Default role assigned is 'User'.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(dto);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Authenticate user credentials and return JWT Access Token + Refresh Token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(dto);
        if (!result.IsSuccess)
            return Unauthorized(result);

        return Ok(result);
    }

    /// <summary>
    /// Exchange an expired Access Token and valid Refresh Token for a new token pair.
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RefreshTokenAsync(dto);
        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Invalidate refresh token for the logged-in user (Logout / Revoke).
    /// </summary>
    [Authorize]
    [HttpPost("revoke-token")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RevokeToken()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return BadRequest("User email claim not found.");

        var revoked = await _authService.RevokeTokenAsync(email);
        if (!revoked)
            return BadRequest("Failed to revoke token.");

        return Ok(new { message = "Token revoked successfully." });
    }

    /// <summary>
    /// Assign a specific role (Admin, Manager, User) to a user. Admin-only.
    /// </summary>
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost("assign-role")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var succeeded = await _authService.AssignRoleAsync(dto);
        if (!succeeded)
            return BadRequest("Failed to assign role. Make sure the user exists.");

        return Ok(new { message = $"Role '{dto.Role}' assigned to '{dto.Email}' successfully." });
    }

    /// <summary>
    /// Grant a specific granular permission claim (e.g. Users.Delete, Reports.Export) to a user. Admin-only.
    /// </summary>
    [Authorize(Roles = UserRoles.Admin)]
    [HttpPost("grant-permission")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GrantPermission([FromBody] GrantPermissionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var succeeded = await _authService.GrantPermissionAsync(dto.Email, dto.Permission);
        if (!succeeded)
            return BadRequest("Failed to grant permission. Make sure the user exists.");

        return Ok(new { message = $"Permission '{dto.Permission}' granted to '{dto.Email}' successfully." });
    }
}
