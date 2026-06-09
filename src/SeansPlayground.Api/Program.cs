using Microsoft.AspNetCore.Authentication.JwtBearer;
using Npgsql;
using SeansPlayground.Contracts;
using SeansPlayground.Core.Playground;
using SeansPlayground.Services;
using SeansPlayground.Services.Dashboard;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddSeansPlaygroundServices();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:3000", "http://127.0.0.1:3000"];

        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Authentication:Authority"];
        options.Audience = builder.Configuration["Authentication:Audience"];
        options.RequireHttpsMetadata = builder.Configuration.GetValue("Authentication:RequireHttpsMetadata", false);
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok", application = PlaygroundConstants.ApplicationName }));

app.MapGet("/api/dashboard/summary", (IPlaygroundDashboardService dashboardService) =>
{
    return Results.Ok(dashboardService.GetSummary());
})
.WithName("GetDashboardSummary");

app.MapGet("/api/system/status", async (IConfiguration configuration, IWebHostEnvironment environment) =>
{
    var connectionString = configuration.GetConnectionString("Postgres")
        ?? throw new InvalidOperationException("Missing Postgres connection string.");

    var databaseStatus = "Unavailable";

    try
    {
        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        await using var command = dataSource.CreateCommand("select 1");
        await command.ExecuteScalarAsync();
        databaseStatus = "Connected";
    }
    catch
    {
        databaseStatus = "Unavailable";
    }

    var response = new SystemStatusResponse(
        PlaygroundConstants.ApplicationName,
        environment.EnvironmentName,
        databaseStatus,
        configuration["Authentication:Authority"] ?? "Not configured",
        DateTimeOffset.UtcNow);

    return Results.Ok(response);
})
.WithName("GetSystemStatus");

app.Run();
