namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundExperienceDto(
    string RoleTitle,
    string OrganizationName,
    string? Location,
    string DateLabel,
    string? DurationLabel,
    IReadOnlyCollection<string> Highlights);
