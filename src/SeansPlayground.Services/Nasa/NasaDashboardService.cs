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
        var recentApods = await dbContext.NasaApodImages
            .AsNoTracking()
            .Where(item => item.ImageBytes != null)
            .OrderByDescending(item => item.ApodDate)
            .Take(10)
            .ToListAsync(cancellationToken);
        var latestApod = recentApods.FirstOrDefault();

        if (latestApod is null)
        {
            latestApod = await dbContext.NasaApodImages
                .AsNoTracking()
                .Where(item => item.ImageBytes != null)
                .OrderByDescending(item => item.ApodDate)
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (recentApods.Count == 0 && latestApod is not null)
        {
            recentApods.Add(latestApod);
        }

        var recentApodDtos = recentApods.Select(ToApodDto).ToArray();

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
            recentApodDtos,
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

        return ToImage(latestApod);
    }

    public async Task<LatestApodImage?> GetApodImageAsync(DateOnly apodDate, CancellationToken cancellationToken)
    {
        var apod = await dbContext.NasaApodImages
            .AsNoTracking()
            .Where(item => item.ApodDate == apodDate && item.ImageBytes != null && item.ContentType != null)
            .FirstOrDefaultAsync(cancellationToken);

        return ToImage(apod);
    }

    public async Task<NasaDonkiEventDetailResponse> GetDonkiEventDetailsAsync(
        string eventType,
        DateOnly? startDate,
        DateOnly? endDate,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var windowEnd = endDate ?? today;
        var windowStart = startDate ?? windowEnd.AddDays(-29);
        var feed = NasaDonkiCatalog.Feeds.FirstOrDefault(
            item => string.Equals(item.EventType, eventType, StringComparison.OrdinalIgnoreCase)) ??
            new NasaDonkiFeedDefinition(eventType.ToUpperInvariant(), eventType.ToUpperInvariant(), "#5b1a8e");

        if (windowStart > windowEnd)
        {
            (windowStart, windowEnd) = (windowEnd, windowStart);
        }

        var storedEvents = await dbContext.NasaDonkiEvents
            .AsNoTracking()
            .Where(item =>
                item.EventType == feed.EventType &&
                item.EventDate >= windowStart &&
                item.EventDate <= windowEnd)
            .OrderByDescending(item => item.OccurredAt ?? DateTimeOffset.MinValue)
            .ThenByDescending(item => item.EventDate)
            .ToArrayAsync(cancellationToken);

        var events = storedEvents
            .Select(item => new NasaDonkiEventDetailDto(
                item.EventType,
                feed.DisplayName,
                feed.Accent,
                item.ExternalId,
                item.OccurredAt,
                item.EventDate,
                item.FetchedAt,
                item.JsonPayload))
            .ToArray();

        return new NasaDonkiEventDetailResponse(
            feed.EventType,
            feed.DisplayName,
            feed.Accent,
            windowStart,
            windowEnd,
            events);
    }

    private static LatestApodImage? ToImage(NasaApodImage? apod)
    {
        return apod?.ImageBytes is null || apod.ContentType is null
            ? null
            : new LatestApodImage(apod.ContentType, apod.ImageBytes, apod.ApodDate);
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
            events.Count == 0 ? null : events.Max(item => item.OccurredAt),
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
            $"/api/nasa/apod/{apod.ApodDate:yyyy-MM-dd}/image",
            apod.FetchedAt);
    }
}
