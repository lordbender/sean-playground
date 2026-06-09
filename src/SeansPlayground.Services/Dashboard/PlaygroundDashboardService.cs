using SeansPlayground.Contracts.Dashboard;

namespace SeansPlayground.Services.Dashboard;

public sealed class PlaygroundDashboardService : IPlaygroundDashboardService
{
    public DashboardSummaryResponse GetSummary()
    {
        MetricCardDto[] metrics =
        [
            new("All Earnings", "$30,200", "warning", "10% changes on profit", "paid"),
            new("Tasks", "145", "error", "28% task performance", "calendar"),
            new("Page Views", "290+", "success", "10k daily views", "article"),
            new("Downloads", "500", "primary", "1k downloads in app store", "thumbsUp")
        ];

        var salesTrend = new SalesTrendDto(
            "Sales Per Day",
            "3%",
            4230,
            321,
            [42, 34, 58, 28, 66, 40]);

        var revenueBreakdown = new RevenueBreakdownDto(
            30200,
            [
                new("Krewe", 46.85m, "#5b1a8e"),
                new("Parade", 45.36m, "#00843d"),
                new("Throws", 7.79m, "#f2c14e")
            ]);

        TrafficSourceDto[] trafficSources =
        [
            new("Direct", 80, "#5b1a8e"),
            new("Social", 50, "#00843d"),
            new("Referral", 20, "#f2c14e"),
            new("Bounce", 60, "#c91f6a"),
            new("Internet", 40, "#35104f")
        ];

        MarketSignalDto[] marketSignals =
        [
            new("Masquerade", -0.99m, "#c91f6a"),
            new("Beads", -7.66m, "#00843d")
        ];

        return new DashboardSummaryResponse(metrics, salesTrend, revenueBreakdown, trafficSources, marketSignals);
    }
}
