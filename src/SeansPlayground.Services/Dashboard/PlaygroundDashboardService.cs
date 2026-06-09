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
                new("Youtube", 46.85m, "#ff3d3d"),
                new("Facebook", 45.36m, "#3367f6"),
                new("Twitter", 7.79m, "#15b8a6")
            ]);

        TrafficSourceDto[] trafficSources =
        [
            new("Direct", 80, "#3367f6"),
            new("Social", 50, "#2b3f52"),
            new("Referral", 20, "#3367f6"),
            new("Bounce", 60, "#2b3f52"),
            new("Internet", 40, "#3367f6")
        ];

        MarketSignalDto[] marketSignals =
        [
            new("Reality", -0.99m, "#ff3d57"),
            new("Infra", -7.66m, "#0fb16f")
        ];

        return new DashboardSummaryResponse(metrics, salesTrend, revenueBreakdown, trafficSources, marketSignals);
    }
}

