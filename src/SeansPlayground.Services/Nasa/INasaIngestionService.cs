namespace SeansPlayground.Services.Nasa;

public interface INasaIngestionService
{
    Task RefreshAsync(CancellationToken cancellationToken);
}
