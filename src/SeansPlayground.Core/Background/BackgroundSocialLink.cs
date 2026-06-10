namespace SeansPlayground.Core.Background;

public sealed class BackgroundSocialLink
{
    public long Id { get; set; }

    public long ProfileId { get; set; }

    public BackgroundProfile? Profile { get; set; }

    public long PlatformId { get; set; }

    public BackgroundSocialPlatform? Platform { get; set; }

    public string DisplayText { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public int SortOrder { get; set; }
}
