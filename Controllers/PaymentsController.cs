using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;
using TransportInfoManagement.API.Services;
using TransportInfoManagement.API.Helpers;

namespace TransportInfoManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IConfiguration _configuration;

    public PaymentsController(ApplicationDbContext context, IEmailService emailService, ILogger<PaymentsController> logger, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments([FromQuery] int? clientId, [FromQuery] string? status)
    {
        var query = _context.Payments
            .Include(p => p.Client)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(p => p.ClientId == clientId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(p => p.Status == status);

        return await query.OrderByDescending(p => p.PaymentDate).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null) return NotFound();
        return payment;
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(Payment payment)
    {
        // Generate payment code if not provided (using Vietnam time UTC+7)
        if (string.IsNullOrEmpty(payment.PaymentCode))
        {
            payment.PaymentCode = $"PAY{TimeZoneHelper.GetVietnamTime():yyyyMMddHHmmss}";
        }

        var vietnamNow = TimeZoneHelper.GetVietnamTime();
        payment.PaymentDate = TimeZoneHelper.ToUtc(vietnamNow);
        payment.CreatedAt = TimeZoneHelper.ToUtc(vietnamNow);

        // Update status based on due date (compare with Vietnam time)
        if (payment.DueDate < TimeZoneHelper.ToUtc(vietnamNow) && payment.Status == "Pending")
        {
            payment.Status = "Overdue";
        }

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, Payment payment)
    {
        if (id != payment.Id) return BadRequest();
        
        _context.Entry(payment).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PaymentExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound();
        
        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetOverduePayments()
    {
        var vietnamNow = TimeZoneHelper.GetVietnamTime();
        var utcNow = TimeZoneHelper.ToUtc(vietnamNow);
        var overduePayments = await _context.Payments
            .Include(p => p.Client)
            .Where(p => p.Status == "Overdue" || (p.DueDate < utcNow && p.Status == "Pending"))
            .OrderBy(p => p.DueDate)
            .ToListAsync();

        return overduePayments;
    }

    [HttpPost("{id}/send-email")]
    [AllowAnonymous] // Allow anonymous access for payment confirmation emails (needed after Stripe redirects)
    public async Task<IActionResult> SendPaymentConfirmationEmail(int id, [FromBody] SendPaymentEmailRequest? request = null)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Client)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            // Get email from request, client, or return error
            string? clientEmail = request?.Email;
            
            if (string.IsNullOrEmpty(clientEmail) && payment.Client != null)
            {
                clientEmail = payment.Client.Email;
            }

            if (string.IsNullOrEmpty(clientEmail))
            {
                return BadRequest(new { message = "Email address not found. Please provide an email address." });
            }

            // Get client name
            string clientName = payment.Client?.ContactPerson ?? 
                               payment.Client?.CompanyName ?? 
                               "Valued Customer";

            // Send confirmation email
            try
            {
                await _emailService.SendPaymentConfirmationAsync(
                    clientEmail: clientEmail,
                    clientName: clientName,
                    paymentCode: payment.PaymentCode,
                    amount: payment.Amount,
                    paymentDate: payment.PaymentDate,
                    paymentMethod: payment.PaymentMethod
                );

                _logger.LogInformation($"Payment confirmation email sent to {clientEmail} for payment {payment.PaymentCode}");

                return Ok(new { 
                    success = true, 
                    message = "Payment confirmation email sent successfully",
                    email = clientEmail
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send payment confirmation email to {clientEmail}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send email. Please check email configuration.",
                    error = ex.Message
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error processing send payment email request for payment ID {id}");
            return StatusCode(500, new { message = "An error occurred while processing your request: " + ex.Message });
        }
    }

    [HttpPost("test-email")]
    [AllowAnonymous] // Allow anonymous access for testing
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest? request = null)
    {
        try
        {
            // Get email from request or use configured sender email
            string testEmail = request?.Email ?? _configuration["EmailSettings:SenderEmail"] ?? "";
            
            if (string.IsNullOrEmpty(testEmail))
            {
                return BadRequest(new { 
                    success = false,
                    message = "No email address provided and no sender email configured." 
                });
            }

            // Validate email format
            if (!System.Text.RegularExpressions.Regex.IsMatch(testEmail, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest(new { 
                    success = false,
                    message = "Invalid email address format." 
                });
            }

            // Get email configuration for display
            string smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "Not configured";
            string port = _configuration["EmailSettings:Port"] ?? "Not configured";
            string senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "Not configured";
            string security = _configuration["EmailSettings:Security"] ?? "Not configured";

            // Create a test email message with more details (using Vietnam time UTC+7)
            string subject = $"Test Email - Excell-On Services - {TimeZoneHelper.FormatVietnamTime(DateTime.UtcNow)}";
            string body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset='utf-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style>
                        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
                        .container {{ max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }}
                        .header h1 {{ margin: 0; font-size: 28px; }}
                        .header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
                        .content {{ padding: 40px 30px; }}
                        .success-badge {{ background: #28a745; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }}
                        .info-box {{ background: #e7f3ff; padding: 20px; border-left: 4px solid #2196F3; margin: 25px 0; border-radius: 4px; }}
                        .info-box strong {{ color: #1976D2; display: block; margin-bottom: 10px; font-size: 16px; }}
                        .info-box p {{ margin: 5px 0; color: #555; }}
                        .test-details {{ background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; }}
                        .test-details h3 {{ margin-top: 0; color: #333; }}
                        .test-details table {{ width: 100%; border-collapse: collapse; }}
                        .test-details td {{ padding: 8px 0; border-bottom: 1px solid #eee; }}
                        .test-details td:first-child {{ font-weight: bold; color: #666; width: 40%; }}
                        .footer {{ background: #f9f9f9; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
                        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>✅ Email Test Successful!</h1>
                            <p>Excell-On Consulting Services</p>
                        </div>
                        <div class='content'>
                            <div class='success-badge'>TEST EMAIL RECEIVED</div>
                            
                            <p>Hello,</p>
                            <p>This is a <strong>test email</strong> from your Excell-On Services application.</p>
                            
                            <div class='info-box'>
                                <strong>📧 Email Configuration Status</strong>
                                <p><strong>SMTP Server:</strong> {smtpServer}</p>
                                <p><strong>Port:</strong> {port}</p>
                                <p><strong>Sender Email:</strong> {senderEmail}</p>
                                <p><strong>Security:</strong> {security}</p>
                                <p><strong>Recipient:</strong> {testEmail}</p>
                            </div>

                            <div class='test-details'>
                                <h3>📋 Test Details</h3>
                                <table>
                                    <tr>
                                        <td>Test Type:</td>
                                        <td>Email Service Verification</td>
                                    </tr>
                                    <tr>
                                        <td>Test Time:</td>
                                        <td>{TimeZoneHelper.FormatVietnamTime(DateTime.UtcNow)}</td>
                                    </tr>
                                    <tr>
                                        <td>Test ID:</td>
                                        <td>TEST-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}</td>
                                    </tr>
                                    <tr>
                                        <td>Status:</td>
                                        <td style='color: #28a745; font-weight: bold;'>✓ Email Sent Successfully</td>
                                    </tr>
                                </table>
                            </div>

                            <p><strong>What this means:</strong></p>
                            <ul style='color: #555;'>
                                <li>Your email service is configured correctly</li>
                                <li>SMTP connection is working properly</li>
                                <li>You can receive payment confirmation emails</li>
                                <li>System notifications will be delivered</li>
                            </ul>

                            <p style='margin-top: 30px;'>If you received this email, your email configuration is working perfectly! 🎉</p>
                        </div>
                        <div class='footer'>
                            <p><strong>Transport Info Management System</strong></p>
                            <p>This is an automated test email. No reply is necessary.</p>
                            <p>Sent at: {TimeZoneHelper.FormatVietnamTime(DateTime.UtcNow)}</p>
                        </div>
                    </div>
                </body>
                </html>";

            // Send the test email
            await _emailService.SendEmailAsync(testEmail, subject, body, isHtml: true);

            _logger.LogInformation($"Test email sent successfully to {testEmail} at {TimeZoneHelper.FormatVietnamTime(DateTime.UtcNow)}");

            // Return detailed success response
            return Ok(new { 
                success = true, 
                message = $"Test email sent successfully to {testEmail}",
                email = testEmail,
                timestamp = TimeZoneHelper.GetVietnamTime(),
                configuration = new {
                    smtpServer = smtpServer,
                    port = port,
                    senderEmail = senderEmail,
                    security = security
                },
                testId = $"TEST-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending test email to {request?.Email ?? "unknown"}");
            
            // Return detailed error response
            return StatusCode(500, new { 
                success = false, 
                message = "Failed to send test email. Please check email configuration.",
                error = ex.Message,
                innerException = ex.InnerException?.Message,
                timestamp = TimeZoneHelper.GetVietnamTime()
            });
        }
    }

    private bool PaymentExists(int id) => _context.Payments.Any(e => e.Id == id);
}

public class TestEmailRequest
{
    public string? Email { get; set; }
}

public class SendPaymentEmailRequest
{
    public string? Email { get; set; }
}

