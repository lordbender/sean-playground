using SeansPlayground.Contracts.Nasa;

namespace SeansPlayground.Services.Nasa;

public interface INasaDashboardService
{
    Task<NasaDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken);

    Task<LatestApodImage?> GetLatestApodImageAsync(CancellationToken cancellationToken);
}
