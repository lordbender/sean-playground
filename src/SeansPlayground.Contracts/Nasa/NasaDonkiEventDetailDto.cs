namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaDonkiEventDetailDto(
    string EventType,
    string DisplayName,
    string Accent,
    string ExternalId,
    DateTimeOffset? OccurredAt,
    DateOnly EventDate,
    DateTimeOffset FetchedAt,
    string RawJsonPayload);
