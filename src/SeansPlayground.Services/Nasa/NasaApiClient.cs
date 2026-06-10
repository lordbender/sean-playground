using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SeansPlayground.Services.Nasa;

public sealed class NasaApiClient(
    HttpClient httpClient,
    IConfiguration configuration,
    ILogger<NasaApiClient> logger) : INasaApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<NasaApodApiResult?> GetApodAsync(DateOnly date, CancellationToken cancellationToken)
    {
        var requestUri = BuildNasaUri(
            "planetary/apod",
            ("date", date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            ("thumbs", "true"));

        using var response = await httpClient.GetAsync(requestUri, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("NASA APOD request failed with status {StatusCode}.", response.StatusCode);
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var payload = document.RootElement.GetRawText();
        var apod = JsonSerializer.Deserialize<NasaApodApiResult>(payload, JsonOptions);

        return apod is null ? null : apod with { JsonPayload = payload };
    }

    public async Task<IReadOnlyCollection<NasaDonkiApiEvent>> GetDonkiEventsAsync(
        string eventType,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var requestUri = BuildNasaUri(
            $"DONKI/{eventType}",
            ("startDate", startDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)),
            ("endDate", endDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)));

        using var response = await httpClient.GetAsync(requestUri, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("NASA DONKI {EventType} request failed with status {StatusCode}.", eventType, response.StatusCode);
            return [];
        }

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        using var document = JsonDocument.Parse(payload);
        var events = new List<NasaDonkiApiEvent>();

        foreach (var element in document.RootElement.EnumerateArray())
        {
            var occurredAt = ReadEventTimestamp(element);
            var eventDate = occurredAt is null
                ? startDate
                : DateOnly.FromDateTime(occurredAt.Value.UtcDateTime);

            events.Add(new NasaDonkiApiEvent(
                eventType,
                ReadExternalId(eventType, element, events.Count),
                occurredAt,
                eventDate,
                element.GetRawText()));
        }

        return events;
    }

    public async Task<DownloadedImage?> DownloadImageAsync(string url, CancellationToken cancellationToken)
    {
        using var response = await httpClient.GetAsync(url, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("NASA APOD image download failed with status {StatusCode}.", response.StatusCode);
            return null;
        }

        var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
        var bytes = await response.Content.ReadAsByteArrayAsync(cancellationToken);

        return new DownloadedImage(contentType, bytes);
    }

    private string BuildNasaUri(string path, params (string Name, string Value)[] query)
    {
        var apiKey = configuration["Nasa:ApiKey"] ?? configuration["DataGov:ApiKey"];
        var baseUrl = configuration["Nasa:BaseUrl"] ?? "https://api.nasa.gov";
        var parameters = query
            .Append(("api_key", apiKey ?? string.Empty))
            .Select(item => $"{Uri.EscapeDataString(item.Item1)}={Uri.EscapeDataString(item.Item2)}");

        return $"{baseUrl.TrimEnd('/')}/{path.TrimStart('/')}?{string.Join("&", parameters)}";
    }

    private static string ReadExternalId(string eventType, JsonElement element, int index)
    {
        foreach (var propertyName in new[] { "flrID", "gstID", "activityID", "ipsID", "shockID", "cmeID" })
        {
            if (element.TryGetProperty(propertyName, out var property) &&
                property.ValueKind == JsonValueKind.String &&
                !string.IsNullOrWhiteSpace(property.GetString()))
            {
                return property.GetString()!;
            }
        }

        var timestamp = ReadEventTimestamp(element)?.ToString("O", CultureInfo.InvariantCulture) ?? index.ToString(CultureInfo.InvariantCulture);

        return $"{eventType}-{timestamp}-{index}";
    }

    private static DateTimeOffset? ReadEventTimestamp(JsonElement element)
    {
        foreach (var propertyName in new[] { "beginTime", "startTime", "eventTime", "time21_5", "peakTime" })
        {
            if (!element.TryGetProperty(propertyName, out var property) || property.ValueKind != JsonValueKind.String)
            {
                continue;
            }

            var value = property.GetString();

            if (DateTimeOffset.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var timestamp))
            {
                return timestamp;
            }
        }

        return null;
    }
}
