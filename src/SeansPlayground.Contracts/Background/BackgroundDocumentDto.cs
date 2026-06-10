namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundDocumentDto(
    string Title,
    string SourceFileName,
    string ContentType,
    IReadOnlyCollection<BackgroundDocumentSectionDto> Sections);
