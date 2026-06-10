using Microsoft.Extensions.DependencyInjection;
using SeansPlayground.Services.Background;
using SeansPlayground.Services.Dashboard;

namespace SeansPlayground.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddSeansPlaygroundServices(this IServiceCollection services)
    {
        services.AddScoped<IBackgroundService, BackgroundService>();
        services.AddSingleton<IPlaygroundDashboardService, PlaygroundDashboardService>();

        return services;
    }
}
