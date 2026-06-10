using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SeansPlayground.Contracts;
using SeansPlayground.Core.Data;
using SeansPlayground.Core.Playground;
using SeansPlayground.Services;
using SeansPlayground.Services.Dashboard;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Missing Postgres connection string.");

builder.Services.AddOpenApi();
builder.Services.AddSeansPlaygroundServices();
builder.Services.AddControllers();
builder.Services.AddDbContext<PlaygroundDbContext>(options => options.UseNpgsql(connectionString));

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
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuers = builder.Configuration.GetSection("Authentication:ValidIssuers").Get<string[]>()
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PlaygroundDbContext>();
    await dbContext.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "ok", application = PlaygroundConstants.ApplicationName }));

app.MapGet("/api/dashboard/summary", (IPlaygroundDashboardService dashboardService) =>
{
    return Results.Ok(dashboardService.GetSummary());
})
.WithName("GetDashboardSummary");

app.MapGet("/api/system/status", async (PlaygroundDbContext dbContext, IConfiguration configuration, IWebHostEnvironment environment) =>
{
    var databaseStatus = "Unavailable";

    try
    {
        databaseStatus = await dbContext.Database.CanConnectAsync()
            ? "Connected"
            : "Unavailable";
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
