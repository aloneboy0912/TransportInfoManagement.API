using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using TransportInfoManagement.API.Helpers;

namespace TransportInfoManagement.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpServer;
    private readonly int _port;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _username;
    private readonly string _password;
    private readonly string _securityOption; // "TLS", "SSL", or "None"

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        // Generic SMTP Configuration - supports multiple email providers
        _smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "";
        _port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
        _senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
        _senderName = _configuration["EmailSettings:SenderName"] ?? "Excell-On Services";
        _username = _configuration["EmailSettings:Username"] ?? "";
        _password = _configuration["EmailSettings:Password"] ?? "";
        _securityOption = _configuration["EmailSettings:Security"] ?? "TLS"; // TLS, SSL, or None

        // Validate configuration
        if (string.IsNullOrEmpty(_smtpServer) || string.IsNullOrEmpty(_senderEmail) || string.IsNullOrEmpty(_username) || string.IsNullOrEmpty(_password))
        {
            _logger.LogWarning("Email settings are not fully configured. Email functionality may not work.");
        }
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_senderName, _senderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            if (isHtml)
            {
                bodyBuilder.HtmlBody = body;
            }
            else
            {
                bodyBuilder.TextBody = body;
            }
            message.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                // Determine security option based on configuration
                SecureSocketOptions securityOption;
                switch (_securityOption.ToUpper())
                {
                    case "SSL":
                        securityOption = SecureSocketOptions.SslOnConnect;
                        break;
                    case "NONE":
                        securityOption = SecureSocketOptions.None;
                        break;
                    case "TLS":
                    default:
                        securityOption = SecureSocketOptions.StartTls;
                        break;
                }

                // Connect to SMTP server with configured security
                await client.ConnectAsync(_smtpServer, _port, securityOption);
                
                // Authenticate if username/password provided
                if (!string.IsNullOrEmpty(_username) && !string.IsNullOrEmpty(_password))
                {
                    await client.AuthenticateAsync(_username, _password);
                }
                
                // Send the email
                await client.SendAsync(message);
                
                // Disconnect gracefully
                await client.DisconnectAsync(true);
            }

            _logger.LogInformation($"Email sent successfully to {to} via {_smtpServer}");
        }
        catch (AuthenticationException ex)
        {
            var errorMsg = $"SMTP authentication failed for {_smtpServer}. Please verify:\n" +
                          "1. Username and password are correct in appsettings.json\n" +
                          "2. SMTP server, port, and security settings are correct\n" +
                          "3. Your email provider allows SMTP access\n" +
                          $"Error details: {ex.Message}";
            _logger.LogError(ex, errorMsg);
            throw new Exception(errorMsg, ex);
        }
        catch (SmtpCommandException ex)
        {
            var errorMsg = $"SMTP error occurred: {ex.Message}";
            
            if (ex.Message.Contains("535", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("authentication", StringComparison.OrdinalIgnoreCase))
            {
                errorMsg += "\n\nSMTP Authentication Troubleshooting:\n" +
                           "- Verify username and password are correct\n" +
                           "- Check SMTP server and port configuration\n" +
                           "- Ensure security option (TLS/SSL) matches your provider\n" +
                           "- Some providers require app-specific passwords or API keys";
            }
            
            _logger.LogError(ex, errorMsg);
            throw new Exception(errorMsg, ex);
        }
        catch (Exception ex)
        {
            var errorMsg = $"Failed to send email to {to}. Error: {ex.Message}";
            
            // Provide helpful hints for common SMTP issues
            if (ex.Message.Contains("authentication", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("535", StringComparison.OrdinalIgnoreCase))
            {
                errorMsg += "\n\nTroubleshooting:\n" +
                           "- Check SMTP server, port, and security settings\n" +
                           "- Verify credentials are correct\n" +
                           "- Ensure your email provider allows SMTP access\n" +
                           "- Check firewall/network settings";
            }
            else if (ex.Message.Contains("connection", StringComparison.OrdinalIgnoreCase))
            {
                errorMsg += "\n\nConnection Troubleshooting:\n" +
                           "- Verify SMTP server address is correct\n" +
                           "- Check port number matches your provider\n" +
                           "- Ensure firewall isn't blocking the connection\n" +
                           "- Try different security option (TLS/SSL)";
            }
            
            _logger.LogError(ex, errorMsg);
            throw new Exception(errorMsg, ex);
        }
    }

    public async Task SendProductRegistrationConfirmationAsync(
        string clientEmail, 
        string clientName, 
        string productName, 
        string productCode, 
        string category)
    {
        var subject = "Product Registration Confirmation - Excell-On Services";
        
        var htmlBody = GetProductRegistrationEmailTemplate(clientName, productName, productCode, category);

        await SendEmailAsync(clientEmail, subject, htmlBody, true);
    }

    private string GetProductRegistrationEmailTemplate(
        string clientName, 
        string productName, 
        string productCode, 
        string category)
    {
        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Product Registration Confirmation</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
        }}
        .content {{
            padding: 20px 0;
        }}
        .success-icon {{
            text-align: center;
            font-size: 48px;
            color: #28a745;
            margin: 20px 0;
        }}
        .product-info {{
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .product-info h3 {{
            margin-top: 0;
            color: #667eea;
        }}
        .info-row {{
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }}
        .info-row:last-child {{
            border-bottom: none;
        }}
        .info-label {{
            font-weight: bold;
            color: #555;
        }}
        .info-value {{
            color: #333;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #777;
            font-size: 12px;
        }}
        .button {{
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #5568d3;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Product Registration Successful</h1>
        </div>
        
        <div class=""content"">
            <div class=""success-icon"">✓</div>
            
            <p>Dear {clientName},</p>
            
            <p>Thank you for registering your product with Excell-On Services! We are pleased to confirm that your product has been successfully registered in our system.</p>
            
            <div class=""product-info"">
                <h3>Product Details</h3>
                <div class=""info-row"">
                    <span class=""info-label"">Product Name:</span>
                    <span class=""info-value"">{productName}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Product Code:</span>
                    <span class=""info-value"">{productCode}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Category:</span>
                    <span class=""info-value"">{category}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Registration Date:</span>
                    <span class=""info-value"">{TimeZoneHelper.GetVietnamTime():MMMM dd, yyyy} (UTC+7)</span>
                </div>
            </div>
            
            <p>Your product is now part of our system, and our team will be in touch with you shortly regarding the next steps.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
            <ul>
                <li><strong>Email:</strong> support@excell-on.com</li>
                <li><strong>Phone:</strong> +1-555-EXCELL</li>
            </ul>
            
            <p style=""text-align: center;"">
                <a href=""#"" class=""button"">View Product Dashboard</a>
            </p>
            
            <p>Thank you for choosing Excell-On Services!</p>
            
            <p>Best regards,<br>
            <strong>The Excell-On Services Team</strong></p>
        </div>
        
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {TimeZoneHelper.GetVietnamTime().Year} Excell-On Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }

    public async Task SendPaymentConfirmationAsync(
        string clientEmail,
        string clientName,
        string paymentCode,
        decimal amount,
        DateTime paymentDate,
        string paymentMethod)
    {
        var subject = "Payment Confirmation - Excell-On Services";
        
        var htmlBody = GetPaymentConfirmationEmailTemplate(clientName, paymentCode, amount, paymentDate, paymentMethod);

        await SendEmailAsync(clientEmail, subject, htmlBody, true);
    }

    private string GetPaymentConfirmationEmailTemplate(
        string clientName,
        string paymentCode,
        decimal amount,
        DateTime paymentDate,
        string paymentMethod)
    {
        return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Payment Confirmation</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }}
        .container {{
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 30px -30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
        }}
        .content {{
            padding: 20px 0;
        }}
        .success-icon {{
            text-align: center;
            font-size: 48px;
            color: #28a745;
            margin: 20px 0;
        }}
        .payment-info {{
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .payment-info h3 {{
            margin-top: 0;
            color: #28a745;
        }}
        .info-row {{
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }}
        .info-row:last-child {{
            border-bottom: none;
        }}
        .info-label {{
            font-weight: bold;
            color: #555;
        }}
        .info-value {{
            color: #333;
        }}
        .amount {{
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            margin: 20px 0;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #777;
            font-size: 12px;
        }}
        .button {{
            display: inline-block;
            padding: 12px 30px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #218838;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>✓ Payment Successful</h1>
        </div>
        
        <div class=""content"">
            <div class=""success-icon"">✓</div>
            
            <p>Dear {clientName},</p>
            
            <p>Thank you for your payment! We are pleased to confirm that your payment has been successfully processed.</p>
            
            <div class=""amount"">
                ${amount:N2}
            </div>
            
            <div class=""payment-info"">
                <h3>Payment Details</h3>
                <div class=""info-row"">
                    <span class=""info-label"">Payment Code:</span>
                    <span class=""info-value"">{paymentCode}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Amount Paid:</span>
                    <span class=""info-value"">${amount:N2}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Payment Date:</span>
                    <span class=""info-value"">{TimeZoneHelper.ToVietnamTime(paymentDate):MMMM dd, yyyy 'at' HH:mm} (UTC+7)</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Payment Method:</span>
                    <span class=""info-value"">{paymentMethod}</span>
                </div>
                <div class=""info-row"">
                    <span class=""info-label"">Status:</span>
                    <span class=""info-value"">Paid</span>
                </div>
            </div>
            
            <p>Your payment has been recorded in our system. Please keep this confirmation email for your records.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
            <ul>
                <li><strong>Email:</strong> support@excell-on.com</li>
                <li><strong>Phone:</strong> +1-555-EXCELL</li>
            </ul>
            
            <p style=""text-align: center;"">
                <a href=""#"" class=""button"">View Payment History</a>
            </p>
            
            <p>Thank you for choosing Excell-On Services!</p>
            
            <p>Best regards,<br>
            <strong>The Excell-On Services Team</strong></p>
        </div>
        
        <div class=""footer"">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {TimeZoneHelper.GetVietnamTime().Year} Excell-On Services. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}

