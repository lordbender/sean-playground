namespace SeansPlayground.Core.Background;

public sealed class BackgroundSectionEntitlement
{
    public long Id { get; set; }

    public string SectionKey { get; set; } = string.Empty;

    public string RoleName { get; set; } = string.Empty;
}
