namespace SeansPlayground.Core.Background;

public sealed class BackgroundProfile
{
    public long Id { get; set; }

    public string Slug { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public string Headline { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string Biography { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<BackgroundDocument> Documents { get; } = new List<BackgroundDocument>();

    public ICollection<BackgroundExperience> Experiences { get; } = new List<BackgroundExperience>();

    public ICollection<BackgroundEducationItem> EducationItems { get; } = new List<BackgroundEducationItem>();

    public ICollection<BackgroundSocialLink> SocialLinks { get; } = new List<BackgroundSocialLink>();

    public ICollection<BackgroundRepository> Repositories { get; } = new List<BackgroundRepository>();
}
