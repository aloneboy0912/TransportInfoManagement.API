namespace TransportInfoManagement.API.Models;

public class CallLog
{
    public int Id { get; set; }
    public int? ClientId { get; set; }
    public Client? Client { get; set; }
    public int? ContactId { get; set; }
    public Contact? Contact { get; set; }
    public int? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public int? ServiceId { get; set; }
    public Service? Service { get; set; }
    public DateTime CallDate { get; set; }
    public int CallDuration { get; set; } // in seconds
    public string CallType { get; set; } = string.Empty; // Inbound, Outbound
    public string Outcome { get; set; } = string.Empty; // Success, No Answer, Busy, Voicemail, Failed, etc.
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }
    public string? Notes { get; set; }
    public bool IsResolved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

