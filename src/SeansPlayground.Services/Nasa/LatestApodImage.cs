namespace SeansPlayground.Services.Nasa;

public sealed record LatestApodImage(string ContentType, byte[] Bytes, DateOnly ApodDate);
