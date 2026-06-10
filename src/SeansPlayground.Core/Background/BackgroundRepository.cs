namespace SeansPlayground.Core.Background;

public sealed class BackgroundRepository
{
    public long Id { get; set; }

    public long ProfileId { get; set; }

    public BackgroundProfile? Profile { get; set; }

    public string OwnerName { get; set; } = string.Empty;

    public string RepositoryName { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public bool IsFeatured { get; set; }

    public int SortOrder { get; set; }
}
