namespace SeansPlayground.Contracts.Dashboard;

public sealed record MarketSignalDto(
    string Name,
    decimal Change,
    string Accent);

