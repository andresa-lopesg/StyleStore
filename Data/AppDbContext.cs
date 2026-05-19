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
    public DbSet<MovimentacaoEstoque> MovimentacoesEstoque { get; set; }


    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var agora = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Modified)
            {
                var prop = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "AtualizadoEm");
                if (prop != null) prop.CurrentValue = agora;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }

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

        // Índices únicos de Email
        modelBuilder.Entity<Funcionario>()
            .HasIndex(f => f.Email).IsUnique();
        modelBuilder.Entity<Funcionario>()
            .HasIndex(f => f.Cpf).IsUnique();
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email).IsUnique();

        // Categoria → Produto: Restrict para não apagar produtos ao deletar categoria
        modelBuilder.Entity<Produto>()
            .HasOne(p => p.Categoria)
            .WithMany(c => c.Produtos)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cliente → Pedido: Restrict para preservar histórico de pedidos
        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Cliente)
            .WithMany()
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        // Produto → ItemPedido: Restrict para preservar histórico financeiro
        modelBuilder.Entity<ItemPedido>()
            .HasOne(i => i.Produto)
            .WithMany(p => p.ItensPedido)
            .HasForeignKey(i => i.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        // MovimentacaoEstoque → Produto: Restrict
        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasOne(m => m.Produto)
            .WithMany()
            .HasForeignKey(m => m.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);

        // MovimentacaoEstoque → ProdutoVariante: nullable, SetNull
        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasOne(m => m.Variante)
            .WithMany()
            .HasForeignKey(m => m.VarianteId)
            .OnDelete(DeleteBehavior.SetNull);

        // MovimentacaoEstoque → Pedido: nullable, SetNull
        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasOne(m => m.Pedido)
            .WithMany()
            .HasForeignKey(m => m.PedidoId)
            .OnDelete(DeleteBehavior.SetNull);

        // Índice para queries de histórico por produto
        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasIndex(m => new { m.ProdutoId, m.CriadoEm });
    }
}
