using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public decimal PrecoCusto { get; set; }
    public int EstoqueTotal { get; set; }
    public string? ImagemUrl { get; set; }
    public string? Referencia { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }

    public ICollection<ProdutoVariante> Variantes { get; set; } = new List<ProdutoVariante>();

    [JsonIgnore]
    public ICollection<ItemPedido> ItensPedido { get; set; } = new List<ItemPedido>();
}
