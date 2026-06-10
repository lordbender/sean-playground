namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundRepositoryDto(
    string OwnerName,
    string RepositoryName,
    string Url,
    string Description,
    bool IsFeatured);
