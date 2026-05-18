using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiClientes.Data;
using ApiClientes.Models;

namespace ApiClientes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProducaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProducaoController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Producoes
            .Include(p => p.Produto)
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var producao = await _context.Producoes
            .Include(p => p.Produto)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (producao == null) return NotFound();
        return Ok(producao);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Producao producao)
    {
        _context.Producoes.Add(producao);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = producao.Id }, producao);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Producao producao)
    {
        if (id != producao.Id) return BadRequest();
        var existing = await _context.Producoes.FindAsync(id);
        if (existing == null) return NotFound();
        _context.Entry(existing).CurrentValues.SetValues(producao);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusProducao status)
    {
        var producao = await _context.Producoes.FindAsync(id);
        if (producao == null) return NotFound();

        var transicoes = new Dictionary<StatusProducao, StatusProducao[]>
        {
            [StatusProducao.Aguardando]   = [StatusProducao.EmAndamento, StatusProducao.Cancelado],
            [StatusProducao.EmAndamento]  = [StatusProducao.Pausado, StatusProducao.Concluido, StatusProducao.Cancelado],
            [StatusProducao.Pausado]      = [StatusProducao.EmAndamento, StatusProducao.Cancelado],
            [StatusProducao.Concluido]    = [],
            [StatusProducao.Cancelado]    = [],
        };

        if (!transicoes[producao.Status].Contains(status))
            return BadRequest($"Transição inválida: {producao.Status} → {status}.");

        producao.Status = status;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producao = await _context.Producoes.FindAsync(id);
        if (producao == null) return NotFound();
        _context.Producoes.Remove(producao);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
