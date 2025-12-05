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
                var existingContact = await _context.Contacts.FindAsync(request.ContactId.Value);
                if (existingContact != null)
                {
                    // Try to find existing client by email
                    client = await _context.Clients
                        .FirstOrDefaultAsync(c => c.Email.ToLower() == existingContact.Email.ToLower());

                    // If no client exists, create one
                    if (client == null)
                    {
                        client = new Client
                        {
                            ClientCode = $"CLT{TimeZoneHelper.GetVietnamTime():yyyyMMddHHmmss}",
                            CompanyName = existingContact.Company ?? existingContact.Name,
                            ContactPerson = existingContact.Name,
                            Email = existingContact.Email,
                            Phone = existingContact.Phone ?? "",
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

            if (payment == null)
            {
                _logger.LogError("Payment was not found after creation");
                return BadRequest(new { message = "Payment was not created successfully" });
            }

            // Ensure contact exists in Contact Manager
            Contact? contact = null;
            
            // If contactId is provided, find existing contact
            if (request.ContactId.HasValue)
            {
                contact = await _context.Contacts.FindAsync(request.ContactId.Value);
            }
            
            // If no contact found, try to find by email
            if (contact == null && !string.IsNullOrEmpty(request.CustomerEmail))
            {
                contact = await _context.Contacts
                    .FirstOrDefaultAsync(c => c.Email.ToLower() == request.CustomerEmail.ToLower());
            }
            
            // If still no contact exists, create one from payment information
            if (contact == null && !string.IsNullOrEmpty(request.CustomerEmail))
            {
                try
                {
                    contact = new Contact
                    {
                        Name = request.CustomerName ?? "Payment Customer",
                        Email = request.CustomerEmail,
                        Company = client?.CompanyName,
                        Phone = client?.Phone ?? string.Empty, // Ensure phone is set to empty string if null, not a date
                        Subject = "Payment Completed",
                        Message = $"Payment of ${request.Amount:F2} completed successfully. Payment Code: {payment.PaymentCode}",
                        CreatedAt = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime()),
                        IsProcessed = true // Mark as processed since payment is complete
                    };
                    
                    _context.Contacts.Add(contact);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Created new contact for payment: {contact.Email} (ID: {contact.Id})");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creating contact for payment: {request.CustomerEmail}");
                    // Don't fail the payment if contact creation fails
                }
            }
            else if (contact != null)
            {
                // Update existing contact to mark as processed
                try
                {
                    contact.IsProcessed = true;
                    // Update contact information if we have better data from payment
                    if (!string.IsNullOrEmpty(request.CustomerName) && string.IsNullOrEmpty(contact.Name))
                    {
                        contact.Name = request.CustomerName;
                    }
                    if (client != null && !string.IsNullOrEmpty(client.Phone) && string.IsNullOrEmpty(contact.Phone))
                    {
                        contact.Phone = client.Phone;
                    }
                    if (client != null && !string.IsNullOrEmpty(client.CompanyName) && string.IsNullOrEmpty(contact.Company))
                    {
                        contact.Company = client.CompanyName;
                    }
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Updated contact for payment: {contact.Email} (ID: {contact.Id})");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error updating contact for payment: {request.CustomerEmail}");
                    // Don't fail the payment if contact update fails
                }
            }

            // Create ClientService when payment is successful
            if (client != null)
            {
                try
                {
                    // Determine which service to assign
                    // If ServiceId is provided, use it; otherwise, try to match by amount or use default service
                    int serviceId = request.ServiceId ?? 0;
                    
                    if (serviceId == 0)
                    {
                        // Try to determine service from payment amount by matching service fees
                        var serviceFees = await _context.ServiceFees
                            .Include(sf => sf.Service)
                            .Where(sf => sf.Service != null && sf.Service.IsActive)
                            .ToListAsync();
                        
                        // Find service that matches the payment amount (within reasonable range)
                        // Payment amount is typically per day per employee, so we'll use the first active service as default
                        var defaultService = await _context.Services
                            .Where(s => s.IsActive)
                            .OrderBy(s => s.Id)
                            .FirstOrDefaultAsync();
                        
                        serviceId = defaultService?.Id ?? 1; // Default to service ID 1 if no services found
                    }
                    
                    // Check if a ClientService already exists for this client and service
                    var existingClientService = await _context.ClientServices
                        .FirstOrDefaultAsync(cs => cs.ClientId == client.Id && 
                                                   cs.ServiceId == serviceId && 
                                                   cs.IsActive);
                    
                    if (existingClientService == null)
                    {
                        // Find an available employee for this service (preferably from Service department)
                        var employee = await _context.Employees
                            .Where(e => e.ServiceId == serviceId && e.IsActive)
                            .OrderBy(e => e.Id)
                            .FirstOrDefaultAsync();
                        
                        // If no employee found for this service, get any active employee
                        if (employee == null)
                        {
                            employee = await _context.Employees
                                .Where(e => e.IsActive)
                                .OrderBy(e => e.Id)
                                .FirstOrDefaultAsync();
                        }
                        
                        var clientService = new ClientService
                        {
                            ClientId = client.Id,
                            ServiceId = serviceId,
                            EmployeeId = employee?.Id,
                            NumberOfEmployees = 1, // Default to 1, can be updated later
                            StartDate = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime()),
                            EndDate = null,
                            IsActive = true,
                            CreatedAt = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime())
                        };
                        
                        _context.ClientServices.Add(clientService);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Created ClientService for client {client.Id} with service {serviceId} (ClientService ID: {clientService.Id})");
                    }
                    else
                    {
                        _logger.LogInformation($"ClientService already exists for client {client.Id} with service {serviceId} (ClientService ID: {existingClientService.Id})");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creating ClientService for payment: ClientId={client.Id}, ServiceId={request.ServiceId}");
                    // Don't fail the payment if ClientService creation fails
                }
            }

            // Create Product when payment is successful
            if (client != null)
            {
                try
                {
                    // Determine which service was purchased
                    int serviceId = request.ServiceId ?? 0;
                    
                    if (serviceId == 0)
                    {
                        // Try to determine service from payment amount by matching service fees
                        var defaultService = await _context.Services
                            .Where(s => s.IsActive)
                            .OrderBy(s => s.Id)
                            .FirstOrDefaultAsync();
                        
                        serviceId = defaultService?.Id ?? 1; // Default to service ID 1 if no services found
                    }
                    
                    // Get the service details
                    var service = await _context.Services.FindAsync(serviceId);
                    if (service == null)
                    {
                        _logger.LogWarning($"Service {serviceId} not found, skipping product creation");
                    }
                    else
                    {
                        // Check if a product already exists for this client and service
                        var existingProduct = await _context.Products
                            .FirstOrDefaultAsync(p => p.ClientId == client.Id && 
                                                      p.ProductName.ToLower() == service.Name.ToLower());
                        
                        if (existingProduct == null)
                        {
                            // Create product based on the purchased service
                            var product = new Product
                            {
                                ClientId = client.Id,
                                ProductCode = $"PRD{TimeZoneHelper.GetVietnamTime():yyyyMMddHHmmss}",
                                ProductName = service.Name,
                                Description = !string.IsNullOrEmpty(request.Notes) 
                                    ? request.Notes 
                                    : $"Service purchased: {service.Description ?? service.Name}",
                                Category = "Service",
                                CreatedAt = TimeZoneHelper.ToUtc(TimeZoneHelper.GetVietnamTime())
                            };
                            
                            _context.Products.Add(product);
                            await _context.SaveChangesAsync();
                            _logger.LogInformation($"Created Product for client {client.Id} with service {serviceId} (Product ID: {product.Id}, Name: {product.ProductName})");
                        }
                        else
                        {
                            _logger.LogInformation($"Product already exists for client {client.Id} with service {serviceId} (Product ID: {existingProduct.Id})");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error creating Product for payment: ClientId={client.Id}, ServiceId={request.ServiceId}");
                    // Don't fail the payment if Product creation fails
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
                                
                                var retryPayment = await _context.Payments
                                    .Include(p => p.Client)
                                    .FirstOrDefaultAsync(p => p.Id == payment.Id);
                                
                                if (retryPayment == null)
                                {
                                    throw new Exception("Payment was not found after retry");
                                }
                                
                                return CreatedAtAction(nameof(GetPayment), new { id = retryPayment.Id }, retryPayment);
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
    public int? ServiceId { get; set; } // Service ID for ClientService creation
    public string? Notes { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
}

