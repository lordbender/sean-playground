namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaDonkiSeriesDto(
    string EventType,
    string DisplayName,
    string Accent,
    int TotalCount,
    DateTimeOffset? LatestOccurredAt,
    IReadOnlyCollection<NasaDailyCountDto> DailyCounts,
    IReadOnlyCollection<NasaDonkiEventDto> RecentEvents);
