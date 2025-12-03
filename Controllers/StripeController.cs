using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;
using TransportInfoManagement.API.Helpers;

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
    public ActionResult<object> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
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
    [AllowAnonymous] // Allow anonymous access for guest checkout
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
                            ClientCode = $"CLT{TimeZoneHelper.GetVietnamTime():yyyyMMddHHmmss}",
                            CompanyName = contact.Company ?? contact.Name,
                            ContactPerson = contact.Name,
                            Email = contact.Email,
                            Phone = contact.Phone ?? "",
                            Address = "",
                            City = "",
                            Country = "",
                            IsActive = true,
                            CreatedAt = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime())
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

            // If no client found, try to find by email or create a guest client for cart checkout
            if (client == null && !string.IsNullOrEmpty(request.CustomerEmail))
            {
                // Try to find existing client by email first (to avoid unique constraint violation)
                client = await _context.Clients
                    .FirstOrDefaultAsync(c => c.Email.ToLower() == request.CustomerEmail.ToLower());
            }

            // If still no client found, create a guest client
            if (client == null)
            {
                var customerEmail = request.CustomerEmail;
                
                // Generate unique email if needed
                if (string.IsNullOrEmpty(customerEmail))
                {
                    customerEmail = $"guest{DateTime.UtcNow.Ticks}@example.com";
                }
                else
                {
                    // Check if email already exists (shouldn't happen if we checked above, but double-check)
                    var emailExists = await _context.Clients
                        .AnyAsync(c => c.Email.ToLower() == customerEmail.ToLower());
                    
                    if (emailExists)
                    {
                        // If email exists, append timestamp to make it unique
                        var emailParts = customerEmail.Split('@');
                        var emailLocal = emailParts[0];
                        var emailDomain = emailParts.Length > 1 ? emailParts[1] : "example.com";
                        customerEmail = $"{emailLocal}_{DateTime.UtcNow.Ticks}@{emailDomain}";
                    }
                }

                client = new Client
                {
                    ClientCode = $"GUEST{TimeZoneHelper.GetVietnamTime():yyyyMMddHHmmss}",
                    CompanyName = request.CustomerName ?? "Guest Customer",
                    ContactPerson = request.CustomerName ?? "Guest",
                    Email = customerEmail,
                    Phone = "",
                    Address = "",
                    City = "",
                    Country = "",
                    IsActive = true,
                    CreatedAt = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime())
                };
                
                try
                {
                    _context.Clients.Add(client);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException)
                {
                    // If still fails (race condition), try to find existing client again
                    if (!string.IsNullOrEmpty(request.CustomerEmail))
                    {
                        client = await _context.Clients
                            .FirstOrDefaultAsync(c => c.Email.ToLower() == request.CustomerEmail.ToLower());
                        if (client == null) throw; // Re-throw if still can't find/create
                    }
                    else
                    {
                        throw; // Re-throw if no email provided
                    }
                }
            }

            // Format payment description/notes
            var paymentNotes = FormatPaymentDescription(request.Notes, request.PaymentIntentId);

            // Create payment record (using Vietnam time UTC+7)
            var vietnamNow = TimeZoneHelper.GetVietnamTime();
            var payment = new Payment
            {
                ClientId = client.Id,
                PaymentCode = $"PAY{vietnamNow:yyyyMMddHHmmss}",
                Amount = request.Amount,
                PaymentDate = TimeZoneHelper.ToUtc(vietnamNow),
                DueDate = TimeZoneHelper.ToUtc(vietnamNow.AddDays(30)),
                PaymentMethod = "Credit Card", // Stripe payments are credit card
                Status = "Paid",
                Notes = paymentNotes,
                CreatedAt = TimeZoneHelper.ToUtc(vietnamNow)
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            // Reload payment with client information
            payment = await _context.Payments
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == payment.Id);

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
        catch (DbUpdateException dbEx)
        {
            // Handle database constraint violations
            var innerException = dbEx.InnerException;
            var errorMessage = "Error confirming payment";
            
            if (innerException != null)
            {
                var innerMessage = innerException.Message.ToLower();
                
                if (innerMessage.Contains("duplicate") || innerMessage.Contains("unique"))
                {
                    errorMessage = "A client with this email already exists. Using existing client information.";
                    _logger.LogWarning(dbEx, "Duplicate email detected, attempting to use existing client");
                    
                    // Try to find and use existing client
                    if (!string.IsNullOrEmpty(request.CustomerEmail))
                    {
                        var existingClient = await _context.Clients
                            .FirstOrDefaultAsync(c => c.Email.ToLower() == request.CustomerEmail.ToLower());
                        
                        if (existingClient != null)
                        {
                            // Retry payment creation with existing client
                            var clientForPayment = existingClient;
                            try
                            {
                                var paymentNotes = FormatPaymentDescription(request.Notes, request.PaymentIntentId);
                                
                                var vietnamNow = TimeZoneHelper.GetVietnamTime();
                                var payment = new Payment
                                {
                                    ClientId = clientForPayment.Id,
                                    PaymentCode = $"PAY{vietnamNow:yyyyMMddHHmmss}",
                                    Amount = request.Amount,
                                    PaymentDate = TimeZoneHelper.ToUtc(vietnamNow),
                                    DueDate = TimeZoneHelper.ToUtc(vietnamNow.AddDays(30)),
                                    PaymentMethod = "Credit Card",
                                    Status = "Paid",
                                    Notes = paymentNotes,
                                    CreatedAt = TimeZoneHelper.ToUtc(vietnamNow)
                                };
                                _context.Payments.Add(payment);
                                await _context.SaveChangesAsync();
                                
                                payment = await _context.Payments
                                    .Include(p => p.Client)
                                    .FirstOrDefaultAsync(p => p.Id == payment.Id);
                                
                                return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
                            }
                            catch (Exception retryEx)
                            {
                                errorMessage = "Error processing payment: " + retryEx.Message;
                                _logger.LogError(retryEx, "Error retrying payment with existing client");
                            }
                        }
                    }
                }
                else
                {
                    errorMessage = $"Database error: {innerException.Message}";
                }
            }
            
            _logger.LogError(dbEx, "Database error confirming payment");
            return BadRequest(new { message = errorMessage });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming payment");
            
            // Extract inner exception message if available
            var detailedMessage = ex.Message;
            if (ex.InnerException != null)
            {
                detailedMessage += $" Details: {ex.InnerException.Message}";
            }
            
            return BadRequest(new { message = $"Error confirming payment: {detailedMessage}" });
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

    /// <summary>
    /// Formats payment description/notes in a clean, professional format
    /// </summary>
    private static string FormatPaymentDescription(string? notes, string paymentIntentId)
    {
        var descriptionParts = new List<string>();

        // Add payment method info
        descriptionParts.Add("Payment Method: Credit Card (Stripe)");

        // Add payment intent ID (for reference, but formatted nicely)
        if (!string.IsNullOrEmpty(paymentIntentId))
        {
            // Extract short ID if it's a mock payment intent
            var shortId = paymentIntentId.Length > 20 
                ? paymentIntentId.Substring(paymentIntentId.Length - 8) 
                : paymentIntentId;
            descriptionParts.Add($"Transaction ID: {shortId}");
        }

        // Add service description if provided
        if (!string.IsNullOrWhiteSpace(notes))
        {
            // Clean up the notes - remove any "Stripe payment completed" generic text
            var cleanNotes = notes.Trim();
            if (!cleanNotes.Equals("Stripe payment completed", StringComparison.OrdinalIgnoreCase) &&
                !cleanNotes.StartsWith("Stripe Payment - Payment Intent:", StringComparison.OrdinalIgnoreCase))
            {
                descriptionParts.Add($"Services: {cleanNotes}");
            }
        }

        // Join with line breaks for better readability
        return string.Join("\n", descriptionParts);
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
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
}

