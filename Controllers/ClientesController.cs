  using Microsoft.AspNetCore.Mvc;                                                                                                                                                                      
  using Microsoft.EntityFrameworkCore;
  using ApiClientes.Data;                                                                                                                                                                              
  using ApiClientes.Models;

  namespace ApiClientes.Controllers;                                                                                                                                                                   
  
  [ApiController]                                                                                                                                                                                      
  [Route("api/[controller]")]
  public class ClientesController : ControllerBase
  {
      private readonly AppDbContext _context;

      public ClientesController(AppDbContext context)                                                                                                                                                  
      {
          _context = context;                                                                                                                                                                          
      }           

      [HttpGet]
      public async Task<IActionResult> GetAll()
      {
          var clientes = await _context.Clientes.ToListAsync();
          return Ok(clientes);                                                                                                                                                                         
      }
                                                                                                                                                                                                       
      [HttpGet("{id}")]
      public async Task<IActionResult> GetById(int id)
      {
          var cliente = await _context.Clientes.FindAsync(id);
          if (cliente == null) return NotFound();                                                                                                                                                      
          return Ok(cliente);
      }                                                                                                                                                                                                
                  
      [HttpPost]
      public async Task<IActionResult> Create(Cliente cliente)
      {                                                                                                                                                                                                
          _context.Clientes.Add(cliente);
          await _context.SaveChangesAsync();                                                                                                                                                           
          return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
      }                                                                                                                                                                                                
  
      [HttpPut("{id}")]                                                                                                                                                                                
      public async Task<IActionResult> Update(int id, Cliente cliente)
      {
          if (id != cliente.Id) return BadRequest();
          _context.Entry(cliente).State = EntityState.Modified;
          await _context.SaveChangesAsync();                                                                                                                                                           
          return NoContent();
      }                                                                                                                                                                                                
                  
      [HttpDelete("{id}")]
      public async Task<IActionResult> Delete(int id)
      {                                                                                                                                                                                                
          var cliente = await _context.Clientes.FindAsync(id);
          if (cliente == null) return NotFound();                                                                                                                                                      
          _context.Clientes.Remove(cliente);
          await _context.SaveChangesAsync();
          return NoContent();                                                                                                                                                                          
      }
  } 