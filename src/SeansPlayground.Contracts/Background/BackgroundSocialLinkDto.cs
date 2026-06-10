namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundSocialLinkDto(
    string PlatformName,
    string DisplayText,
    string Url,
    bool IsActive);
