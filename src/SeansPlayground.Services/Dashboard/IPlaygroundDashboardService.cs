using SeansPlayground.Contracts.Dashboard;

namespace SeansPlayground.Services.Dashboard;

public interface IPlaygroundDashboardService
{
    DashboardSummaryResponse GetSummary();
}

