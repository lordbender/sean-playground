namespace SeansPlayground.Core.Background;

public sealed class BackgroundDocumentSection
{
    public long Id { get; set; }

    public long DocumentId { get; set; }

    public BackgroundDocument? Document { get; set; }

    public string Heading { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public int SectionOrder { get; set; }
}
