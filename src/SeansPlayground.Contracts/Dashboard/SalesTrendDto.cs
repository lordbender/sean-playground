namespace SeansPlayground.Contracts.Dashboard;

public sealed record SalesTrendDto(
    string Title,
    string Change,
    decimal TotalRevenue,
    int TodaySales,
    IReadOnlyCollection<int> Points);

