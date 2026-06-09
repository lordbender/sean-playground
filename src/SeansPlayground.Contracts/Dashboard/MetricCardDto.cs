namespace SeansPlayground.Contracts.Dashboard;

public sealed record MetricCardDto(
    string Label,
    string Value,
    string Accent,
    string Detail,
    string Icon);

