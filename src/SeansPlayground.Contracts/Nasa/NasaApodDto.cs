namespace SeansPlayground.Contracts.Nasa;

public sealed record NasaApodDto(
    DateOnly Date,
    string Title,
    string Explanation,
    string? Copyright,
    string MediaType,
    string SourceUrl,
    string? HdUrl,
    string? ImageUrl,
    DateTimeOffset FetchedAt);
