using System.ComponentModel.DataAnnotations;

namespace ApiClientes.Models;

public enum StatusProducao
{
    Aguardando = 0,
    EmAndamento = 1,
    Pausado = 2,
    Concluido = 3,
    Cancelado = 4
}

public class Producao
{
    public int Id { get; set; }
    public int QuantidadePlanejada { get; set; }
    public int QuantidadeProduzida { get; set; }
    public StatusProducao Status { get; set; } = StatusProducao.Aguardando;
    public DateTime DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    [MaxLength(1000)] public string? Observacao { get; set; }
    [MaxLength(150)]  public string Responsavel { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }

    public int? FuncionarioId { get; set; }
    public Funcionario? Funcionario { get; set; }
}
