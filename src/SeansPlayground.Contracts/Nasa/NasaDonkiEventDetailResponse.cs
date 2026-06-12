namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaDonkiEventDetailResponse(
    string EventType,
    string DisplayName,
    string Accent,
    DateOnly WindowStart,
    DateOnly WindowEnd,
    IReadOnlyCollection<NasaDonkiEventDetailDto> Events);
