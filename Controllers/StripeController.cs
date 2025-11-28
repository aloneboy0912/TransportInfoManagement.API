using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StripeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StripeController> _logger;

    public StripeController(ApplicationDbContext context, ILogger<StripeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("create-payment-intent")]
    public async Task<ActionResult<object>> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
    {
        try
        {
            // Calculate amount in cents (Stripe uses cents)
            var amountInCents = (long)(request.Amount * 100);

            // For now, return a mock payment intent
            // In production, you would use Stripe.NET to create a real payment intent
            // Example: var paymentIntent = await stripeService.CreatePaymentIntentAsync(amountInCents, request.Currency);
            
            var paymentIntent = new
            {
                clientSecret = $"pi_mock_{Guid.NewGuid()}", // Mock client secret
                amount = amountInCents,
                currency = request.Currency ?? "usd"
            };

            return Ok(paymentIntent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment intent");
            return BadRequest(new { message = "Error creating payment intent: " + ex.Message });
        }
    }

    [HttpPost("confirm-payment")]
    public async Task<ActionResult<Payment>> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
    {
        try
        {
            // Find or create client based on contact information
            Client? client = null;
            if (request.ContactId.HasValue)
            {
                var contact = await _context.Contacts.FindAsync(request.ContactId.Value);
                if (contact != null)
                {
                    // Try to find existing client by email
                    client = await _context.Clients
                        .FirstOrDefaultAsync(c => c.Email.ToLower() == contact.Email.ToLower());

                    // If no client exists, create one
                    if (client == null)
                    {
                        client = new Client
                        {
                            ClientCode = $"CLT{DateTime.UtcNow:yyyyMMddHHmmss}",
                            CompanyName = contact.Company ?? contact.Name,
                            ContactPerson = contact.Name,
                            Email = contact.Email,
                            Phone = contact.Phone ?? "",
                            Address = "",
                            City = "",
                            Country = "",
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Clients.Add(client);
                        await _context.SaveChangesAsync();
                    }
                }
            }

            if (client == null && request.ClientId.HasValue)
            {
                client = await _context.Clients.FindAsync(request.ClientId.Value);
            }

            if (client == null)
            {
                return BadRequest(new { message = "Client not found" });
            }

            // Create payment record
            var payment = new Payment
            {
                ClientId = client.Id,
                PaymentCode = $"PAY{DateTime.UtcNow:yyyyMMddHHmmss}",
                Amount = request.Amount,
                PaymentDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                PaymentMethod = "Credit Card", // Stripe payments are credit card
                Status = "Paid",
                Notes = $"Stripe Payment - Payment Intent: {request.PaymentIntentId}\n{request.Notes ?? ""}",
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Mark contact as processed if contactId is provided
            if (request.ContactId.HasValue)
            {
                var contact = await _context.Contacts.FindAsync(request.ContactId.Value);
                if (contact != null)
                {
                    contact.IsProcessed = true;
                    await _context.SaveChangesAsync();
                }
            }

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            return BadRequest(new { message = "Error confirming payment: " + ex.Message });
        }
    }

    [HttpGet("payment/{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null) return NotFound();
        return payment;
    }
}

public class CreatePaymentIntentRequest
{
    public decimal Amount { get; set; }
    public string? Currency { get; set; } = "usd";
    public string? Description { get; set; }
    public int? ContactId { get; set; }
}

public class ConfirmPaymentRequest
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int? ClientId { get; set; }
    public int? ContactId { get; set; }
    public string? Notes { get; set; }
}

