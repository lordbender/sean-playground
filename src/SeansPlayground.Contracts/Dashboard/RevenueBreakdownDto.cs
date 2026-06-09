namespace SeansPlayground.Contracts.Dashboard;

public sealed record RevenueBreakdownDto(
    decimal TotalRevenue,
    IReadOnlyCollection<RevenueChannelDto> Channels);

public sealed record RevenueChannelDto(
    string Name,
    decimal Percentage,
    string Accent);

