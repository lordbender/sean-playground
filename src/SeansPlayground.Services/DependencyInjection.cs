using Microsoft.Extensions.DependencyInjection;
using SeansPlayground.Services.Background;
using SeansPlayground.Services.Nasa;
using SeansPlayground.Services.Registration;

namespace SeansPlayground.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddSeansPlaygroundServices(this IServiceCollection services)
    {
        services.AddScoped<IBackgroundService, BackgroundService>();
        services.AddScoped<INasaDashboardService, NasaDashboardService>();
        services.AddScoped<INasaIngestionService, NasaIngestionService>();
        services.AddHttpClient<INasaApiClient, NasaApiClient>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<IUserRegistrationService, KeycloakUserRegistrationService>();
        services.AddHostedService<NasaDailyIngestionHostedService>();

        return services;
    }
}
