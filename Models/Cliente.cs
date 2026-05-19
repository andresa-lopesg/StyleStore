using System.ComponentModel.DataAnnotations;

namespace ApiClientes.Models;

public class Cliente
{
    public int Id { get; set; }
    [MaxLength(150)] public string Nome { get; set; } = string.Empty;
    [MaxLength(150)] public string Email { get; set; } = string.Empty;
    [MaxLength(20)]  public string Telefone { get; set; } = string.Empty;
}
