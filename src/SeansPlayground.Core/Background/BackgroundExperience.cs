namespace SeansPlayground.Core.Background;

public sealed class BackgroundExperience
{
    public long Id { get; set; }

    public long ProfileId { get; set; }

    public BackgroundProfile? Profile { get; set; }

    public string RoleTitle { get; set; } = string.Empty;

    public string OrganizationName { get; set; } = string.Empty;

    public string? Location { get; set; }

    public DateOnly StartOn { get; set; }

    public DateOnly? EndOn { get; set; }

    public string DateLabel { get; set; } = string.Empty;

    public string? DurationLabel { get; set; }

    public int SortOrder { get; set; }

    public ICollection<BackgroundExperienceHighlight> Highlights { get; } = new List<BackgroundExperienceHighlight>();
}
