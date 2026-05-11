using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public class ItemPedido
{
    public int Id { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public string? Tamanho { get; set; }
    public string? Cor { get; set; }

    public int PedidoId { get; set; }
    [JsonIgnore]
    public Pedido? Pedido { get; set; }

    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
}
