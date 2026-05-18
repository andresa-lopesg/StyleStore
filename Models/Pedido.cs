namespace ApiClientes.Models;

public enum StatusPedido
{
    Pendente = 0,
    Confirmado = 1,
    EmProducao = 2,
    Separando = 3,
    Enviado = 4,
    Entregue = 5,
    Cancelado = 6
}

public class Pedido
{
    public int Id { get; set; }
    public DateTime DataPedido { get; set; } = DateTime.UtcNow;
    public StatusPedido Status { get; set; } = StatusPedido.Pendente;
    public decimal Total { get; set; }
    public decimal Desconto { get; set; }
    public string? Observacao { get; set; }
    public string? EnderecoEntrega { get; set; }
    public DateTime? DataEntregaPrevista { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public int? FuncionarioId { get; set; }
    public Funcionario? Funcionario { get; set; }

    public ICollection<ItemPedido> Itens { get; set; } = new List<ItemPedido>();
}
