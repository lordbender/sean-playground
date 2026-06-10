using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SeansPlayground.Core.Data;
using SeansPlayground.Core.Nasa;

namespace SeansPlayground.Services.Nasa;

public sealed class NasaIngestionService(
    PlaygroundDbContext dbContext,
    INasaApiClient nasaApiClient,
    IConfiguration configuration,
    ILogger<NasaIngestionService> logger) : INasaIngestionService
{
    public async Task RefreshAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(configuration["Nasa:ApiKey"] ?? configuration["DataGov:ApiKey"]))
        {
            logger.LogWarning("NASA ingestion skipped because no API key is configured.");
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await RefreshApodAsync(today, cancellationToken);

        foreach (var feed in NasaDonkiCatalog.Feeds)
        {
            try
            {
                await RefreshDonkiFeedAsync(feed.EventType, today, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "NASA DONKI {EventType} ingestion failed.", feed.EventType);
            }
        }
    }

    private async Task RefreshApodAsync(DateOnly today, CancellationToken cancellationToken)
    {
        if (await dbContext.NasaApodImages.AnyAsync(item => item.ApodDate == today, cancellationToken))
        {
            return;
        }

        var apod = await nasaApiClient.GetApodAsync(today, cancellationToken);

        if (apod is null)
        {
            return;
        }

        DownloadedImage? image = null;

        if (string.Equals(apod.MediaType, "image", StringComparison.OrdinalIgnoreCase))
        {
            image = await nasaApiClient.DownloadImageAsync(apod.HdUrl ?? apod.Url, cancellationToken);
        }

        dbContext.NasaApodImages.Add(new NasaApodImage
        {
            ApodDate = apod.Date,
            Title = apod.Title,
            Explanation = apod.Explanation,
            Copyright = apod.Copyright,
            MediaType = apod.MediaType,
            SourceUrl = apod.Url,
            HdUrl = apod.HdUrl,
            ContentType = image?.ContentType,
            ImageBytes = image?.Bytes,
            JsonPayload = apod.JsonPayload,
            FetchedAt = DateTimeOffset.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task RefreshDonkiFeedAsync(
        string eventType,
        DateOnly today,
        CancellationToken cancellationToken)
    {
        var hasExistingData = await dbContext.NasaDonkiEvents
            .AnyAsync(item => item.EventType == eventType, cancellationToken);

        var startDate = hasExistingData ? today.AddDays(-1) : today.AddDays(-30);
        var events = await nasaApiClient.GetDonkiEventsAsync(eventType, startDate, today, cancellationToken);

        foreach (var nasaEvent in events)
        {
            var exists = await dbContext.NasaDonkiEvents.AnyAsync(
                item => item.EventType == eventType && item.ExternalId == nasaEvent.ExternalId,
                cancellationToken);

            if (exists)
            {
                continue;
            }

            dbContext.NasaDonkiEvents.Add(new NasaDonkiEvent
            {
                EventType = eventType,
                ExternalId = nasaEvent.ExternalId,
                OccurredAt = nasaEvent.OccurredAt,
                EventDate = nasaEvent.EventDate,
                JsonPayload = nasaEvent.JsonPayload,
                FetchedAt = DateTimeOffset.UtcNow
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
