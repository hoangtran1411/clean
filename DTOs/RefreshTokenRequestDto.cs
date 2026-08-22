using System.ComponentModel.DataAnnotations;

namespace IdentityJwtDemo.DTOs;

public class RefreshTokenRequestDto
{
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
