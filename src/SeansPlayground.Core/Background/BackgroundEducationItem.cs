namespace SeansPlayground.Core.Background;

public sealed class BackgroundEducationItem
{
    public long Id { get; set; }

    public long ProfileId { get; set; }

    public BackgroundProfile? Profile { get; set; }

    public string InstitutionName { get; set; } = string.Empty;

    public string DegreeName { get; set; } = string.Empty;

    public string? FieldOfStudy { get; set; }

    public string? Note { get; set; }

    public int SortOrder { get; set; }
}
