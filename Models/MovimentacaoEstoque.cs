using System.Text.Json.Serialization;

namespace ApiClientes.Models;

public enum TipoMovimentacao
{
    Entrada = 0,
    Saida = 1,
    Reserva = 2,
    Cancelamento = 3
}

public class MovimentacaoEstoque
{
    public int Id { get; set; }
    public int ProdutoId { get; set; }
    public int? VarianteId { get; set; }
    public TipoMovimentacao Tipo { get; set; }
    public int Quantidade { get; set; }
    public int EstoqueAnterior { get; set; }
    public int EstoqueAtual { get; set; }
    public string? Motivo { get; set; }
    public int? PedidoId { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Produto Produto { get; set; } = null!;
    public ProdutoVariante? Variante { get; set; }
    [JsonIgnore]
    public Pedido? Pedido { get; set; }
}
