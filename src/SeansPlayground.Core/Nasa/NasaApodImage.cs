namespace SeansPlayground.Core.Nasa;

public sealed class NasaApodImage
{
    public long Id { get; set; }

    public DateOnly ApodDate { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Explanation { get; set; } = string.Empty;

    public string? Copyright { get; set; }

    public string MediaType { get; set; } = string.Empty;

    public string SourceUrl { get; set; } = string.Empty;

    public string? HdUrl { get; set; }

    public string? ContentType { get; set; }

    public byte[]? ImageBytes { get; set; }

    public string JsonPayload { get; set; } = "{}";

    public DateTimeOffset FetchedAt { get; set; }
}
