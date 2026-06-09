namespace SeansPlayground.Contracts.Dashboard;

public sealed record DashboardSummaryResponse(
    IReadOnlyCollection<MetricCardDto> Metrics,
    SalesTrendDto SalesTrend,
    RevenueBreakdownDto RevenueBreakdown,
    IReadOnlyCollection<TrafficSourceDto> TrafficSources,
    IReadOnlyCollection<MarketSignalDto> MarketSignals);

