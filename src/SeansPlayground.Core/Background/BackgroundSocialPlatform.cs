namespace SeansPlayground.Core.Background;

public sealed class BackgroundSocialPlatform
{
    public long Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public ICollection<BackgroundSocialLink> Links { get; } = new List<BackgroundSocialLink>();
}
