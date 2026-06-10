namespace SeansPlayground.Core.Background;

public sealed class BackgroundDocument
{
    public long Id { get; set; }

    public long ProfileId { get; set; }

    public BackgroundProfile? Profile { get; set; }

    public string Title { get; set; } = string.Empty;

    public string SourceFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public string PlainText { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<BackgroundDocumentSection> Sections { get; } = new List<BackgroundDocumentSection>();
}
