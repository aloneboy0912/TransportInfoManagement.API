using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;
using TransportInfoManagement.API.Services;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        ApplicationDbContext context, 
        IEmailService emailService,
        ILogger<ProductsController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] int? clientId)
    {
        var query = _context.Products
            .Include(p => p.Client)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(p => p.ClientId == clientId.Value);

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound();
        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        // Generate product code if not provided
        if (string.IsNullOrEmpty(product.ProductCode))
        {
            product.ProductCode = $"PRD{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        product.CreatedAt = DateTime.UtcNow;
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Load the product with client information for email
        var productWithClient = await _context.Products
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == product.Id);

        // Send confirmation email if client exists and has email
        if (productWithClient?.Client != null && !string.IsNullOrEmpty(productWithClient.Client.Email))
        {
            try
            {
                await _emailService.SendProductRegistrationConfirmationAsync(
                    clientEmail: productWithClient.Client.Email,
                    clientName: productWithClient.Client.ContactPerson ?? productWithClient.Client.CompanyName,
                    productName: productWithClient.ProductName,
                    productCode: productWithClient.ProductCode,
                    category: productWithClient.Category ?? "N/A"
                );
                _logger.LogInformation($"Product registration confirmation email sent to {productWithClient.Client.Email}");
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the request
                _logger.LogError(ex, $"Failed to send product registration email to {productWithClient.Client.Email}: {ex.Message}");
            }
        }

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productWithClient ?? product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id) return BadRequest();
        
        _context.Entry(product).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();
        
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool ProductExists(int id) => _context.Products.Any(e => e.Id == id);
}

