using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiClientes.Data;
using ApiClientes.Models;
using ApiClientes.Dtos;

namespace ApiClientes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context) => _context = context;

    private static UsuarioResponseDto ToDto(Usuario u) => new()
    {
        Id = u.Id,
        Nome = u.Nome,
        Email = u.Email,
        CriadoEm = u.CriadoEm,
    };

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var usuarios = await _context.Usuarios.ToListAsync();
        return Ok(usuarios.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();
        return Ok(ToDto(usuario));
    }

    [HttpPost]
    public async Task<IActionResult> Create(UsuarioCreateDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("E-mail já cadastrado.");

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, ToDto(usuario));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UsuarioUpdateDto dto)
    {
        if (id != dto.Id) return BadRequest();

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email && u.Id != id))
            return BadRequest("E-mail já cadastrado.");

        usuario.Nome = dto.Nome;
        usuario.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.Senha))
            usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

        await _context.SaveChangesAsync();
        return Ok(ToDto(usuario));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
