using SeansPlayground.Contracts.Nasa;

namespace SeansPlayground.Services.Nasa;

public interface INasaDashboardService
{
    Task<NasaDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken);

    Task<LatestApodImage?> GetLatestApodImageAsync(CancellationToken cancellationToken);

    Task<LatestApodImage?> GetApodImageAsync(DateOnly apodDate, CancellationToken cancellationToken);
}
