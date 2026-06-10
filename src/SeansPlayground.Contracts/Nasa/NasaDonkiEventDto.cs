namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaDonkiEventDto(
    string EventType,
    string ExternalId,
    DateTimeOffset? OccurredAt,
    DateOnly EventDate);
