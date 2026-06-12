using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Nasa;
using SeansPlayground.Services.Nasa;
using System.Text.Json;

namespace SeansPlayground.Tests;

public sealed class NasaDashboardServiceTests(PostgreSqlFixture fixture) : IClassFixture<PostgreSqlFixture>
{
    [Fact]
    public async Task DonkiDetailReturnsWindowedEventsWithRawPayload()
    {
        await using var dbContext = fixture.CreateContext();
        var externalIds = new[] { "FLR-2025-01-02T010000", "FLR-2025-01-05T010000", "FLR-2025-02-01T010000" };
        var existing = await dbContext.NasaDonkiEvents
            .Where(item => externalIds.Contains(item.ExternalId))
            .ToArrayAsync();
        dbContext.NasaDonkiEvents.RemoveRange(existing);

        dbContext.NasaDonkiEvents.AddRange(
            new NasaDonkiEvent
            {
                EventType = "FLR",
                ExternalId = externalIds[0],
                OccurredAt = new DateTimeOffset(2025, 1, 2, 1, 0, 0, TimeSpan.Zero),
                EventDate = new DateOnly(2025, 1, 2),
                JsonPayload = """{"flrID":"FLR-2025-01-02T010000","classType":"M1.2","sourceLocation":"N15E20"}""",
                FetchedAt = new DateTimeOffset(2025, 1, 2, 2, 0, 0, TimeSpan.Zero)
            },
            new NasaDonkiEvent
            {
                EventType = "FLR",
                ExternalId = externalIds[1],
                OccurredAt = new DateTimeOffset(2025, 1, 5, 1, 0, 0, TimeSpan.Zero),
                EventDate = new DateOnly(2025, 1, 5),
                JsonPayload = """{"flrID":"FLR-2025-01-05T010000","classType":"X2.1","sourceLocation":"S01W44"}""",
                FetchedAt = new DateTimeOffset(2025, 1, 5, 2, 0, 0, TimeSpan.Zero)
            },
            new NasaDonkiEvent
            {
                EventType = "FLR",
                ExternalId = externalIds[2],
                OccurredAt = new DateTimeOffset(2025, 2, 1, 1, 0, 0, TimeSpan.Zero),
                EventDate = new DateOnly(2025, 2, 1),
                JsonPayload = """{"flrID":"FLR-2025-02-01T010000","classType":"C4.8"}""",
                FetchedAt = new DateTimeOffset(2025, 2, 1, 2, 0, 0, TimeSpan.Zero)
            });

        await dbContext.SaveChangesAsync();

        var service = new NasaDashboardService(dbContext);
        var detail = await service.GetDonkiEventDetailsAsync(
            "flr",
            new DateOnly(2025, 1, 1),
            new DateOnly(2025, 1, 31),
            CancellationToken.None);

        Assert.Equal("FLR", detail.EventType);
        Assert.Equal("Solar Flare", detail.DisplayName);
        Assert.Equal(new DateOnly(2025, 1, 1), detail.WindowStart);
        Assert.Equal(new DateOnly(2025, 1, 31), detail.WindowEnd);
        Assert.Equal(2, detail.Events.Count);
        Assert.Equal(externalIds[1], detail.Events.First().ExternalId);
        using var rawPayload = JsonDocument.Parse(detail.Events.First().RawJsonPayload);
        Assert.Equal("X2.1", rawPayload.RootElement.GetProperty("classType").GetString());
        Assert.DoesNotContain(detail.Events, item => item.ExternalId == externalIds[2]);
    }

    [Fact]
    public async Task DashboardReturnsTenMostRecentStoredApodImages()
    {
        await using var dbContext = fixture.CreateContext();
        var firstDate = new DateOnly(2025, 1, 1);
        var dates = Enumerable.Range(0, 12)
            .Select(firstDate.AddDays)
            .ToArray();

        var existing = await dbContext.NasaApodImages
            .Where(item => dates.Contains(item.ApodDate))
            .ToArrayAsync();
        dbContext.NasaApodImages.RemoveRange(existing);

        foreach (var date in dates)
        {
            dbContext.NasaApodImages.Add(new NasaApodImage
            {
                ApodDate = date,
                Title = $"APOD {date:yyyy-MM-dd}",
                Explanation = $"Stored APOD for {date:yyyy-MM-dd}.",
                MediaType = "image",
                SourceUrl = $"https://example.test/{date:yyyyMMdd}.jpg",
                ContentType = "image/jpeg",
                ImageBytes = [1, 2, 3, (byte)date.Day],
                JsonPayload = "{}",
                FetchedAt = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
            });
        }

        await dbContext.SaveChangesAsync();

        var service = new NasaDashboardService(dbContext);
        var dashboard = await service.GetDashboardAsync(CancellationToken.None);

        Assert.NotNull(dashboard.LatestApod);
        Assert.Equal(new DateOnly(2025, 1, 12), dashboard.LatestApod.Date);
        Assert.Equal(10, dashboard.RecentApods.Count);
        Assert.Equal(new DateOnly(2025, 1, 12), dashboard.RecentApods.First().Date);
        Assert.Equal(new DateOnly(2025, 1, 3), dashboard.RecentApods.Last().Date);
        Assert.All(dashboard.RecentApods, apod => Assert.Equal($"/api/nasa/apod/{apod.Date:yyyy-MM-dd}/image", apod.ImageUrl));

        var image = await service.GetApodImageAsync(new DateOnly(2025, 1, 7), CancellationToken.None);

        Assert.NotNull(image);
        Assert.Equal(new DateOnly(2025, 1, 7), image.ApodDate);
        Assert.Equal("image/jpeg", image.ContentType);
        Assert.Equal([1, 2, 3, 7], image.Bytes);
    }
}
