namespace SeansPlayground.Core.Background;

public sealed class BackgroundExperienceHighlight
{
    public long Id { get; set; }

    public long ExperienceId { get; set; }

    public BackgroundExperience? Experience { get; set; }

    public string HighlightText { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
