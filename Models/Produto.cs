using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class Produto
{
    public int Id { get; set; }
    [MaxLength(200)] public string Nome { get; set; } = string.Empty;
    [MaxLength(1000)] public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public decimal PrecoCusto { get; set; }
    public int EstoqueTotal { get; set; }
    [MaxLength(500)] public string? ImagemUrl { get; set; }
    [MaxLength(50)]  public string? Referencia { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public ICollection<ProdutoVariante> Variantes { get; set; } = new List<ProdutoVariante>();

    [JsonIgnore]
    public ICollection<ItemPedido> ItensPedido { get; set; } = new List<ItemPedido>();
}
