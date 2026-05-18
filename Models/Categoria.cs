using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class Categoria
{
    public int Id { get; set; }
    [MaxLength(100)] public string Nome { get; set; } = string.Empty;
    [MaxLength(500)] public string Descricao { get; set; } = string.Empty;
    public bool Ativa { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    [JsonIgnore]
    public ICollection<Produto> Produtos { get; set; } = new List<Produto>();
}
