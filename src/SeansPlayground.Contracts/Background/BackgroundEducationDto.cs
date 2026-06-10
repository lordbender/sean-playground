namespace SeansPlayground.Contracts.Background;

public sealed record BackgroundEducationDto(
    string InstitutionName,
    string DegreeName,
    string? FieldOfStudy,
    string? Note);
