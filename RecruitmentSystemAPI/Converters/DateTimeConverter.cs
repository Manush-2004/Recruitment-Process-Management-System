using System.Text.Json;
using System.Text.Json.Serialization;

namespace RecruitmentSystemAPI.Converters;

/// <summary>
/// Custom DateTime converter that preserves the exact datetime value without timezone conversion.
/// This ensures that scheduled times are displayed exactly as entered by users.
/// </summary>
public class DateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var dateTimeString = reader.GetString();
        if (string.IsNullOrEmpty(dateTimeString))
            throw new JsonException("DateTime value cannot be null or empty");

        // Parse the datetime and ensure it's treated as Unspecified (no timezone)
        var dateTime = DateTime.Parse(dateTimeString);
        return DateTime.SpecifyKind(dateTime, DateTimeKind.Unspecified);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Always write as Unspecified to avoid timezone conversion
        var unspecifiedDateTime = DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
        
        // Format as ISO 8601 without timezone (e.g., "2024-01-15T14:30:00")
        writer.WriteStringValue(unspecifiedDateTime.ToString("yyyy-MM-ddTHH:mm:ss"));
    }
}

