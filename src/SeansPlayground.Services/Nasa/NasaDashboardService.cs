using Microsoft.EntityFrameworkCore;
using SeansPlayground.Contracts.Nasa;
using SeansPlayground.Core.Data;
using SeansPlayground.Core.Nasa;

namespace SeansPlayground.Services.Nasa;

public sealed class NasaDashboardService(PlaygroundDbContext dbContext) : INasaDashboardService
{
    public async Task<NasaDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var windowStart = today.AddDays(-29);
        var latestApod = await dbContext.NasaApodImages
            .AsNoTracking()
            .Where(item => item.ImageBytes != null)
            .OrderByDescending(item => item.ApodDate)
            .FirstOrDefaultAsync(cancellationToken);

        var events = await dbContext.NasaDonkiEvents
            .AsNoTracking()
            .Where(item => item.EventDate >= windowStart && item.EventDate <= today)
            .OrderByDescending(item => item.OccurredAt ?? DateTimeOffset.MinValue)
            .ToListAsync(cancellationToken);

        var series = NasaDonkiCatalog.Feeds
            .Select(feed => BuildSeries(feed, events.Where(item => item.EventType == feed.EventType).ToList(), windowStart, today))
            .ToArray();

        return new NasaDashboardResponse(
            latestApod is null ? null : ToApodDto(latestApod),
            series,
            windowStart,
            today,
            DateTimeOffset.UtcNow);
    }

    public async Task<LatestApodImage?> GetLatestApodImageAsync(CancellationToken cancellationToken)
    {
        var latestApod = await dbContext.NasaApodImages
            .AsNoTracking()
            .Where(item => item.ImageBytes != null && item.ContentType != null)
            .OrderByDescending(item => item.ApodDate)
            .FirstOrDefaultAsync(cancellationToken);

        return latestApod?.ImageBytes is null || latestApod.ContentType is null
            ? null
            : new LatestApodImage(latestApod.ContentType, latestApod.ImageBytes, latestApod.ApodDate);
    }

    private static NasaDonkiSeriesDto BuildSeries(
        NasaDonkiFeedDefinition feed,
        IReadOnlyCollection<NasaDonkiEvent> events,
        DateOnly windowStart,
        DateOnly windowEnd)
    {
        var countsByDate = events
            .GroupBy(item => item.EventDate)
            .ToDictionary(group => group.Key, group => group.Count());

        var dailyCounts = Enumerable.Range(0, windowEnd.DayNumber - windowStart.DayNumber + 1)
            .Select(offset =>
            {
                var date = windowStart.AddDays(offset);
                return new NasaDailyCountDto(date, countsByDate.GetValueOrDefault(date));
            })
            .ToArray();

        var recentEvents = events
            .OrderByDescending(item => item.OccurredAt ?? DateTimeOffset.MinValue)
            .Take(5)
            .Select(item => new NasaDonkiEventDto(item.EventType, item.ExternalId, item.OccurredAt, item.EventDate))
            .ToArray();

        return new NasaDonkiSeriesDto(
            feed.EventType,
            feed.DisplayName,
            feed.Accent,
            events.Count,
            events.Max(item => item.OccurredAt),
            dailyCounts,
            recentEvents);
    }

    private static NasaApodDto ToApodDto(NasaApodImage apod)
    {
        return new NasaApodDto(
            apod.ApodDate,
            apod.Title,
            apod.Explanation,
            apod.Copyright,
            apod.MediaType,
            apod.SourceUrl,
            apod.HdUrl,
            "/api/nasa/apod/latest/image",
            apod.FetchedAt);
    }
}
