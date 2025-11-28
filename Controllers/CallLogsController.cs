using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransportInfoManagement.API.Data;
using TransportInfoManagement.API.Models;

namespace TransportInfoManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CallLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CallLogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CallLog>>> GetCallLogs(
        [FromQuery] int? clientId,
        [FromQuery] int? employeeId,
        [FromQuery] int? serviceId,
        [FromQuery] string? callType,
        [FromQuery] string? outcome,
        [FromQuery] bool? isResolved,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.CallLogs
            .Include(c => c.Client)
            .Include(c => c.Contact)
            .Include(c => c.Employee)
            .Include(c => c.Service)
            .AsQueryable();

        if (clientId.HasValue)
            query = query.Where(c => c.ClientId == clientId.Value);

        if (employeeId.HasValue)
            query = query.Where(c => c.EmployeeId == employeeId.Value);

        if (serviceId.HasValue)
            query = query.Where(c => c.ServiceId == serviceId.Value);

        if (!string.IsNullOrEmpty(callType))
            query = query.Where(c => c.CallType == callType);

        if (!string.IsNullOrEmpty(outcome))
            query = query.Where(c => c.Outcome == outcome);

        if (isResolved.HasValue)
            query = query.Where(c => c.IsResolved == isResolved.Value);

        if (startDate.HasValue)
            query = query.Where(c => c.CallDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(c => c.CallDate <= endDate.Value);

        return await query
            .OrderByDescending(c => c.CallDate)
            .ThenByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CallLog>> GetCallLog(int id)
    {
        var callLog = await _context.CallLogs
            .Include(c => c.Client)
            .Include(c => c.Contact)
            .Include(c => c.Employee)
            .Include(c => c.Service)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (callLog == null) return NotFound();
        return callLog;
    }

    [HttpPost]
    public async Task<ActionResult<CallLog>> CreateCallLog(CallLog callLog)
    {
        // Validate required fields
        if (string.IsNullOrEmpty(callLog.CustomerName))
            return BadRequest(new { message = "Customer name is required" });

        if (string.IsNullOrEmpty(callLog.CallType))
            return BadRequest(new { message = "Call type is required" });

        if (string.IsNullOrEmpty(callLog.Outcome))
            return BadRequest(new { message = "Outcome is required" });

        // Set default values
        callLog.CreatedAt = DateTime.UtcNow;
        
        // If callDate is not set or is default, use current time
        if (callLog.CallDate == default)
            callLog.CallDate = DateTime.UtcNow;

        // Ensure call duration is not negative
        if (callLog.CallDuration < 0)
            callLog.CallDuration = 0;

        _context.CallLogs.Add(callLog);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new { message = "Error creating call log: " + ex.Message });
        }

        // Reload with related entities for response
        await _context.Entry(callLog).Reference(c => c.Client).LoadAsync();
        await _context.Entry(callLog).Reference(c => c.Contact).LoadAsync();
        await _context.Entry(callLog).Reference(c => c.Employee).LoadAsync();
        await _context.Entry(callLog).Reference(c => c.Service).LoadAsync();

        return CreatedAtAction(nameof(GetCallLog), new { id = callLog.Id }, callLog);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCallLog(int id, CallLog callLog)
    {
        if (id != callLog.Id) 
            return BadRequest(new { message = "ID mismatch" });

        // Validate required fields
        if (string.IsNullOrEmpty(callLog.CustomerName))
            return BadRequest(new { message = "Customer name is required" });

        if (string.IsNullOrEmpty(callLog.CallType))
            return BadRequest(new { message = "Call type is required" });

        if (string.IsNullOrEmpty(callLog.Outcome))
            return BadRequest(new { message = "Outcome is required" });

        // Ensure call duration is not negative
        if (callLog.CallDuration < 0)
            callLog.CallDuration = 0;

        _context.Entry(callLog).State = EntityState.Modified;
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CallLogExists(id))
                return NotFound();
            throw;
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new { message = "Error updating call log: " + ex.Message });
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCallLog(int id)
    {
        var callLog = await _context.CallLogs.FindAsync(id);
        if (callLog == null) 
            return NotFound();

        _context.CallLogs.Remove(callLog);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new { message = "Error deleting call log: " + ex.Message });
        }

        return NoContent();
    }

    [HttpPatch("{id}/resolve")]
    public async Task<IActionResult> ToggleResolved(int id)
    {
        var callLog = await _context.CallLogs.FindAsync(id);
        if (callLog == null)
            return NotFound();

        callLog.IsResolved = !callLog.IsResolved;
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new { message = "Error updating call log: " + ex.Message });
        }

        return Ok(new { id = callLog.Id, isResolved = callLog.IsResolved });
    }

    private bool CallLogExists(int id) => _context.CallLogs.Any(c => c.Id == id);
}

