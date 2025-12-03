namespace TransportInfoManagement.API.Helpers;

/// <summary>
/// Helper class for timezone conversions
/// Converts UTC to UTC+7 (Vietnam/Thailand timezone)
/// </summary>
public static class TimeZoneHelper
{
    private static readonly TimeZoneInfo VietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time") 
        ?? TimeZoneInfo.CreateCustomTimeZone("UTC+7", TimeSpan.FromHours(7), "Vietnam Time", "Vietnam Time");

    /// <summary>
    /// Gets current time in UTC+7
    /// </summary>
    public static DateTime GetVietnamTime()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, VietnamTimeZone);
    }

    /// <summary>
    /// Converts UTC DateTime to Vietnam time (UTC+7)
    /// </summary>
    public static DateTime ToVietnamTime(DateTime utcDateTime)
    {
        if (utcDateTime.Kind == DateTimeKind.Unspecified)
        {
            // Assume it's UTC if unspecified
            utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
        }
        
        if (utcDateTime.Kind == DateTimeKind.Utc)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, VietnamTimeZone);
        }
        
        // If already local, convert to UTC first then to Vietnam time
        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime.ToUniversalTime(), VietnamTimeZone);
    }

    /// <summary>
    /// Converts Vietnam time (UTC+7) to UTC
    /// </summary>
    public static DateTime ToUtc(DateTime vietnamTime)
    {
        if (vietnamTime.Kind == DateTimeKind.Unspecified)
        {
            // Assume it's Vietnam time if unspecified
            vietnamTime = DateTime.SpecifyKind(vietnamTime, DateTimeKind.Unspecified);
        }
        
        return TimeZoneInfo.ConvertTimeToUtc(vietnamTime, VietnamTimeZone);
    }

    /// <summary>
    /// Formats DateTime in Vietnam timezone with timezone indicator
    /// </summary>
    public static string FormatVietnamTime(DateTime utcDateTime, string format = "yyyy-MM-dd HH:mm:ss")
    {
        var vietnamTime = ToVietnamTime(utcDateTime);
        return vietnamTime.ToString(format) + " (UTC+7)";
    }
}

