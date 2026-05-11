namespace ApiClientes.Models;

public class ProdutoVariante
{
    public int Id { get; set; }
    public string Tamanho { get; set; } = string.Empty;
    public string Cor { get; set; } = string.Empty;
    public int Estoque { get; set; }
    public string? CodigoBarras { get; set; }

    public int ProdutoId { get; set; }
    public Produto? Produto { get; set; }
}
