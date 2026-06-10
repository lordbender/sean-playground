namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundResponse(
    string SectionKey,
    IReadOnlyCollection<string> AllowedRoles,
    BackgroundProfileDto Profile,
    BackgroundDocumentDto Document,
    IReadOnlyCollection<BackgroundExperienceDto> Experiences,
    IReadOnlyCollection<BackgroundEducationDto> Education,
    IReadOnlyCollection<BackgroundSocialLinkDto> SocialLinks,
    IReadOnlyCollection<BackgroundRepositoryDto> Repositories);
