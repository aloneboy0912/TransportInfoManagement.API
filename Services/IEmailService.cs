namespace TransportInfoManagement.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task SendProductRegistrationConfirmationAsync(string clientEmail, string clientName, string productName, string productCode, string category);
    Task SendPaymentConfirmationAsync(string clientEmail, string clientName, string paymentCode, decimal amount, DateTime paymentDate, string paymentMethod);
}

