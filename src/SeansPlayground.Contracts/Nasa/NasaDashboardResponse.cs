namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaDashboardResponse(
    NasaApodDto? LatestApod,
    IReadOnlyCollection<NasaApodDto> RecentApods,
    IReadOnlyCollection<NasaDonkiSeriesDto> DonkiSeries,
    DateOnly WindowStart,
    DateOnly WindowEnd,
    DateTimeOffset GeneratedAt);
