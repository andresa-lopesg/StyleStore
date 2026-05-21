using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiClientes.Data;
using ApiClientes.Models;

namespace ApiClientes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProdutosController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Produtos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes)
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var produto = await _context.Produtos
            .Include(p => p.Categoria)
            .Include(p => p.Variantes)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (produto == null) return NotFound();
        return Ok(produto);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Produto produto)
    {
        _context.Produtos.Add(produto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = produto.Id }, produto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Produto produto)
    {
        if (id != produto.Id) return BadRequest();
        var existing = await _context.Produtos.FindAsync(id);
        if (existing == null) return NotFound();
        _context.Entry(existing).CurrentValues.SetValues(produto);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return NotFound();
        _context.Produtos.Remove(produto);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/imagem")]
    public async Task<IActionResult> UploadImagem(int id, IFormFile arquivo)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return NotFound();

        var ext = Path.GetExtension(arquivo.FileName).ToLowerInvariant();
        if (!new[] { ".jpg", ".jpeg", ".png", ".webp" }.Contains(ext))
            return BadRequest("Formato não permitido. Use JPG, PNG ou WEBP.");

        if (arquivo.Length > 5 * 1024 * 1024)
            return BadRequest("Arquivo muito grande. Máximo 5 MB.");

        var dir = Path.Combine("wwwroot", "images", "produtos");
        Directory.CreateDirectory(dir);

        if (!string.IsNullOrEmpty(produto.ImagemUrl) && produto.ImagemUrl.StartsWith("/images/"))
        {
            var oldPath = Path.Combine("wwwroot", produto.ImagemUrl.TrimStart('/'));
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(dir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await arquivo.CopyToAsync(stream);

        produto.ImagemUrl = $"/images/produtos/{fileName}";
        await _context.SaveChangesAsync();

        return Ok(new { url = produto.ImagemUrl });
    }

    [HttpGet("{id}/estoque/historico")]
    public async Task<IActionResult> GetHistoricoEstoque(int id)
    {
        var existe = await _context.Produtos.AnyAsync(p => p.Id == id);
        if (!existe) return NotFound();
        var historico = await _context.MovimentacoesEstoque
            .Include(m => m.Variante)
            .Where(m => m.ProdutoId == id)
            .OrderByDescending(m => m.CriadoEm)
            .ToListAsync();
        return Ok(historico);
    }

    [HttpPost("{id}/estoque/movimentacao")]
    public async Task<IActionResult> AjustarEstoque(int id, [FromBody] AjusteEstoqueDto dto)
    {
        var produto = await _context.Produtos.FindAsync(id);
        if (produto == null) return NotFound();
        if (dto.Quantidade <= 0) return BadRequest("Quantidade deve ser maior que zero.");

        var estoqueAnterior = produto.EstoqueTotal;

        if (dto.Tipo == TipoMovimentacao.Saida)
        {
            if (dto.Quantidade > produto.EstoqueTotal)
                return BadRequest("Quantidade de saída supera o estoque atual.");
            produto.EstoqueTotal -= dto.Quantidade;
        }
        else
        {
            produto.EstoqueTotal += dto.Quantidade;
        }

        var movimentacao = new MovimentacaoEstoque
        {
            ProdutoId = id,
            Tipo = dto.Tipo,
            Quantidade = dto.Quantidade,
            EstoqueAnterior = estoqueAnterior,
            EstoqueAtual = produto.EstoqueTotal,
            Motivo = dto.Motivo,
            CriadoEm = DateTime.UtcNow
        };

        _context.MovimentacoesEstoque.Add(movimentacao);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHistoricoEstoque), new { id }, movimentacao);
    }
}

public class AjusteEstoqueDto
{
    public TipoMovimentacao Tipo { get; set; }
    public int Quantidade { get; set; }
    public string? Motivo { get; set; }
}
