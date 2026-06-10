using System.Text.Json.Serialization;

namespace SeansPlayground.Services.Nasa;

public sealed record NasaApodApiResult(
    [property: JsonPropertyName("date")] DateOnly Date,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("explanation")] string Explanation,
    [property: JsonPropertyName("copyright")] string? Copyright,
    [property: JsonPropertyName("media_type")] string MediaType,
    [property: JsonPropertyName("url")] string Url,
    [property: JsonPropertyName("hdurl")] string? HdUrl,
    string JsonPayload = "{}");

public sealed record NasaDonkiApiEvent(
    string EventType,
    string ExternalId,
    DateTimeOffset? OccurredAt,
    DateOnly EventDate,
    string JsonPayload);

public sealed record DownloadedImage(string ContentType, byte[] Bytes);
