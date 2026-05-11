using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiClientes.Data;
using ApiClientes.Models;

namespace ApiClientes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FuncionariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public FuncionariosController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _context.Funcionarios.ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var funcionario = await _context.Funcionarios.FindAsync(id);
        if (funcionario == null) return NotFound();
        return Ok(funcionario);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Funcionario funcionario)
    {
        _context.Funcionarios.Add(funcionario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = funcionario.Id }, funcionario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Funcionario funcionario)
    {
        if (id != funcionario.Id) return BadRequest();
        _context.Entry(funcionario).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var funcionario = await _context.Funcionarios.FindAsync(id);
        if (funcionario == null) return NotFound();
        _context.Funcionarios.Remove(funcionario);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
