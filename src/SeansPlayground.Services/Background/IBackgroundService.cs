using SeansPlayground.Contracts.Background;

namespace SeansPlayground.Services.Background;

public interface IBackgroundService
{
    Task<BackgroundResponse?> GetBackgroundAsync(IReadOnlyCollection<string> userRoles, CancellationToken cancellationToken);
}
