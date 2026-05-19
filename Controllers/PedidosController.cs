using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiClientes.Data;
using ApiClientes.Models;

namespace ApiClientes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Funcionario)
            .Include(p => p.Itens).ThenInclude(i => i.Produto)
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Cliente)
            .Include(p => p.Funcionario)
            .Include(p => p.Itens).ThenInclude(i => i.Produto)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (pedido == null) return NotFound();
        return Ok(pedido);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Pedido pedido)
    {
        foreach (var item in pedido.Itens)
        {
            var produto = await _context.Produtos.FindAsync(item.ProdutoId);
            if (produto == null) return BadRequest($"Produto {item.ProdutoId} não encontrado.");
            if (produto.EstoqueTotal < item.Quantidade)
                return BadRequest($"Estoque insuficiente para '{produto.Nome}'. Disponível: {produto.EstoqueTotal}");
            item.PrecoUnitario = produto.Preco;
        }

        pedido.Total = pedido.Itens.Sum(i => i.PrecoUnitario * i.Quantidade) - pedido.Desconto;

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Pedido pedido)
    {
        if (id != pedido.Id) return BadRequest();
        var existing = await _context.Pedidos.FindAsync(id);
        if (existing == null) return NotFound();
        _context.Entry(existing).CurrentValues.SetValues(pedido);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusPedido status)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Itens)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (pedido == null) return NotFound();

        var transicoes = new Dictionary<StatusPedido, StatusPedido[]>
        {
            [StatusPedido.Pendente]    = [StatusPedido.Confirmado, StatusPedido.Cancelado],
            [StatusPedido.Confirmado]  = [StatusPedido.EmProducao, StatusPedido.Cancelado],
            [StatusPedido.EmProducao]  = [StatusPedido.Separando,  StatusPedido.Cancelado],
            [StatusPedido.Separando]   = [StatusPedido.Enviado,    StatusPedido.Cancelado],
            [StatusPedido.Enviado]     = [StatusPedido.Entregue],
            [StatusPedido.Entregue]    = [],
            [StatusPedido.Cancelado]   = [],
        };

        if (!transicoes[pedido.Status].Contains(status))
            return BadRequest($"Transição inválida: {pedido.Status} → {status}.");

        if (status == StatusPedido.Confirmado)
        {
            foreach (var item in pedido.Itens)
            {
                var produto = await _context.Produtos.FindAsync(item.ProdutoId);
                if (produto == null) continue;
                var anterior = produto.EstoqueTotal;
                produto.EstoqueTotal -= item.Quantidade;
                _context.MovimentacoesEstoque.Add(new Models.MovimentacaoEstoque
                {
                    ProdutoId = produto.Id,
                    Tipo = Models.TipoMovimentacao.Saida,
                    Quantidade = item.Quantidade,
                    EstoqueAnterior = anterior,
                    EstoqueAtual = produto.EstoqueTotal,
                    Motivo = $"Pedido #{pedido.Id}",
                    PedidoId = pedido.Id,
                });
            }
        }
        else if (status == StatusPedido.Cancelado && pedido.Status == StatusPedido.Confirmado)
        {
            foreach (var item in pedido.Itens)
            {
                var produto = await _context.Produtos.FindAsync(item.ProdutoId);
                if (produto == null) continue;
                var anterior = produto.EstoqueTotal;
                produto.EstoqueTotal += item.Quantidade;
                _context.MovimentacoesEstoque.Add(new Models.MovimentacaoEstoque
                {
                    ProdutoId = produto.Id,
                    Tipo = Models.TipoMovimentacao.Cancelamento,
                    Quantidade = item.Quantidade,
                    EstoqueAnterior = anterior,
                    EstoqueAtual = produto.EstoqueTotal,
                    Motivo = $"Cancelamento Pedido #{pedido.Id}",
                    PedidoId = pedido.Id,
                });
            }
        }

        pedido.Status = status;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var pedido = await _context.Pedidos.FindAsync(id);
        if (pedido == null) return NotFound();
        _context.Pedidos.Remove(pedido);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
