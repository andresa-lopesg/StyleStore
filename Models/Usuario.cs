using System.ComponentModel.DataAnnotations;

namespace ApiClientes.Models;

public class Usuario
{
    public int Id { get; set; }
    [MaxLength(150)] public string Nome { get; set; } = string.Empty;
    [MaxLength(150)] public string Email { get; set; } = string.Empty;
    [MaxLength(255)] public string SenhaHash { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
