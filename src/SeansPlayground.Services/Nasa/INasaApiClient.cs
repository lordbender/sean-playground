namespace SeansPlayground.Services.Nasa;

public interface INasaApiClient
{
    Task<NasaApodApiResult?> GetApodAsync(DateOnly date, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<NasaDonkiApiEvent>> GetDonkiEventsAsync(
        string eventType,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken);

    Task<DownloadedImage?> DownloadImageAsync(string url, CancellationToken cancellationToken);
}
