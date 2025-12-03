using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net;
using TransportInfoManagement.API.Services;
using TransportInfoManagement.API.Helpers;

namespace TransportInfoManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailController> _logger;

    public EmailController(IEmailService emailService, IConfiguration configuration, ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("send")]
    [AllowAnonymous] // Allow anonymous access for contact forms
    public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Subject))
            {
                return BadRequest(new { 
                    success = false,
                    message = "Subject is required" 
                });
            }

            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { 
                    success = false,
                    message = "Message is required" 
                });
            }

            // Determine recipient email
            string recipientEmail = request.To ?? _configuration["EmailSettings:SenderEmail"] ?? "";
            
            if (string.IsNullOrEmpty(recipientEmail))
            {
                return BadRequest(new { 
                    success = false,
                    message = "No recipient email address available. Please provide a 'to' email address or configure sender email in appsettings.json" 
                });
            }

            // Validate email format
            if (!System.Text.RegularExpressions.Regex.IsMatch(recipientEmail, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            {
                return BadRequest(new { 
                    success = false,
                    message = "Invalid email address format" 
                });
            }

            // Get sender information
            string senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
            string senderName = _configuration["EmailSettings:SenderName"] ?? "Excell-On Consulting Services";

            // Build email body with HTML formatting
            string emailBody = BuildEmailBody(request, senderName);

            // Send email
            await _emailService.SendEmailAsync(recipientEmail, request.Subject, emailBody, isHtml: true);

            _logger.LogInformation($"Email sent successfully to {recipientEmail} with subject: {request.Subject}");

            return Ok(new { 
                success = true,
                message = $"Email sent successfully to {recipientEmail}",
                to = recipientEmail,
                subject = request.Subject,
                timestamp = TimeZoneHelper.GetVietnamTime()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error sending email to {request.To ?? "unknown"}");
            
            return StatusCode(500, new { 
                success = false,
                message = "Failed to send email. Please check email configuration.",
                error = ex.Message,
                innerException = ex.InnerException?.Message,
                timestamp = TimeZoneHelper.GetVietnamTime()
            });
        }
    }

    private string BuildEmailBody(SendEmailRequest request, string senderName)
    {
        // Build a professional HTML email body
        string additionalInfo = "";
        
        if (!string.IsNullOrWhiteSpace(request.Name) || 
            !string.IsNullOrWhiteSpace(request.Phone) || 
            !string.IsNullOrWhiteSpace(request.Company))
        {
            additionalInfo = @"
                <div style='background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;'>
                    <h3 style='margin-top: 0; color: #1976D2;'>Sender Information</h3>";
            
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                additionalInfo += $"<p style='margin: 5px 0;'><strong>Name:</strong> {WebUtility.HtmlEncode(request.Name)}</p>";
            }
            
            if (!string.IsNullOrWhiteSpace(request.Company))
            {
                additionalInfo += $"<p style='margin: 5px 0;'><strong>Company:</strong> {WebUtility.HtmlEncode(request.Company)}</p>";
            }
            
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                additionalInfo += $"<p style='margin: 5px 0;'><strong>Phone:</strong> {WebUtility.HtmlEncode(request.Phone)}</p>";
            }
            
            additionalInfo += "</div>";
        }

        // Process message: HTML encode and convert newlines to <br>
        string processedMessage = WebUtility.HtmlEncode(request.Message)
            .Replace("\n", "<br>")
            .Replace("\r", "");

        return $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }}
                    .container {{ max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ padding: 40px 30px; }}
                    .message {{ background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap; }}
                    .footer {{ background: #f9f9f9; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>📧 New Email Message</h1>
                        <p>{senderName}</p>
                    </div>
                    <div class='content'>
                        <h2 style='color: #333; margin-top: 0;'>{WebUtility.HtmlEncode(request.Subject)}</h2>
                        {additionalInfo}
                        <div class='message'>
                            {processedMessage}
                        </div>
                    </div>
                    <div class='footer'>
                        <p><strong>Excell-On Consulting Services</strong></p>
                        <p>This email was sent via the Send Email form</p>
                        <p>Sent at: {TimeZoneHelper.FormatVietnamTime(DateTime.UtcNow)}</p>
                    </div>
                </div>
            </body>
            </html>";
    }
}

public class SendEmailRequest
{
    public string? To { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
}

