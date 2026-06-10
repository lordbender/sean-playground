using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SeansPlayground.Services.Nasa;

public sealed class NasaDailyIngestionHostedService(
    IServiceScopeFactory serviceScopeFactory,
    ILogger<NasaDailyIngestionHostedService> logger) : Microsoft.Extensions.Hosting.BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RefreshOnceAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RefreshOnceAsync(stoppingToken);
        }
    }

    private async Task RefreshOnceAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = serviceScopeFactory.CreateScope();
            var ingestionService = scope.ServiceProvider.GetRequiredService<INasaIngestionService>();
            await ingestionService.RefreshAsync(cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "NASA daily ingestion failed.");
        }
    }
}
