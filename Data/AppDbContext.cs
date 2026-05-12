using Microsoft.EntityFrameworkCore;
using ApiClientes.Models;

namespace ApiClientes.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<ProdutoVariante> ProdutoVariantes { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<ItemPedido> ItensPedido { get; set; }
    public DbSet<Producao> Producoes { get; set; }


//configuram o schema e tipos de coluna. As colunas de cada tabela são definidas pelos Models na pasta Models/. Tudo isso é interpretado pelo Entity Framework para criar o banco automaticamente.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("dbo");  

        modelBuilder.Entity<Produto>()
            .Property(p => p.Preco)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Produto>()
            .Property(p => p.PrecoCusto)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Funcionario>()
            .Property(f => f.Salario)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Total)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Desconto)
            .HasColumnType("numeric(18,2)");

        modelBuilder.Entity<ItemPedido>()
            .Property(i => i.PrecoUnitario)
            .HasColumnType("numeric(18,2)");
    }
}
