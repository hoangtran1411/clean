using System.ComponentModel.DataAnnotations;

namespace IdentityJwtDemo.DTOs;

public class GrantPermissionDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Permission { get; set; } = string.Empty;
}
