using Microsoft.Extensions.DependencyInjection;
using SeansPlayground.Services.Dashboard;

namespace SeansPlayground.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddSeansPlaygroundServices(this IServiceCollection services)
    {
        services.AddSingleton<IPlaygroundDashboardService, PlaygroundDashboardService>();

        return services;
    }
}

