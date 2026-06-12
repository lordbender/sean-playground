using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Nasa;
using SeansPlayground.Services.Nasa;

namespace SeansPlayground.Tests;

public sealed class NasaDashboardServiceTests(PostgreSqlFixture fixture) : IClassFixture<PostgreSqlFixture>
{
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
