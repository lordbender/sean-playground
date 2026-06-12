using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SeansPlayground.Api.OpenApi;
using SeansPlayground.Contracts;
using SeansPlayground.Core.Data;
using SeansPlayground.Core.Playground;
using SeansPlayground.Services;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Missing Postgres connection string.");

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sean's Playground API",
        Version = "v1",
        Description = "Local API for Sean's Playground dashboard, background profile, NASA data, registration, and system status."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste a Keycloak access token. The header is sent as: Bearer {token}."
    });

    options.OperationFilter<AuthorizeOperationFilter>();
});
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

app.UseSwagger(options =>
{
    options.RouteTemplate = "api/swagger/{documentName}/swagger.json";
});
app.UseSwaggerUI(options =>
{
    options.DocumentTitle = "Sean's Playground API";
    options.RoutePrefix = "api/swagger";
    options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "Sean's Playground API v1");
});

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "ok", application = PlaygroundConstants.ApplicationName }))
    .WithName("GetHealth")
    .WithTags("System")
    .WithSummary("Checks API process health.")
    .WithDescription("Returns a lightweight health response for Docker and reverse proxy checks.")
    .Produces(StatusCodes.Status200OK);

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
    .WithName("GetSystemStatus")
    .WithTags("System")
    .WithSummary("Gets application dependency status.")
    .WithDescription("Checks database connectivity and returns the configured identity provider and runtime environment.")
    .Produces<SystemStatusResponse>(StatusCodes.Status200OK);

app.Run();
