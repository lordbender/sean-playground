namespace SeansPlayground.Core.Nasa;

public sealed class NasaDonkiEvent
{
    public long Id { get; set; }

    public string EventType { get; set; } = string.Empty;

    public string ExternalId { get; set; } = string.Empty;

    public DateTimeOffset? OccurredAt { get; set; }

    public DateOnly EventDate { get; set; }

    public string JsonPayload { get; set; } = "{}";

    public DateTimeOffset FetchedAt { get; set; }
}
