using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class Categoria
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public bool Ativa { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<Produto> Produtos { get; set; } = new List<Produto>();
}
