using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class Funcionario
{
    public int Id { get; set; }
    [MaxLength(150)] public string Nome { get; set; } = string.Empty;
    [MaxLength(150)] public string Email { get; set; } = string.Empty;
    [MaxLength(11)]  public string Telefone { get; set; } = string.Empty;
    [MaxLength(100)] public string Cargo { get; set; } = string.Empty;
    public decimal Salario { get; set; }
    [MaxLength(11)]  public string Cpf { get; set; } = string.Empty;
    public DateTime DataAdmissao { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    [JsonIgnore]
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}
