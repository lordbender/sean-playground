using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Data;
using Testcontainers.PostgreSql;

namespace SeansPlayground.Tests;

public sealed class PostgreSqlFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder("postgres:16-alpine")
        .WithDatabase("seans_playground_tests")
        .WithUsername("seans_playground")
        .WithPassword("seans_playground")
        .Build();

    public async Task InitializeAsync()
    {
        await container.StartAsync();

        await using var dbContext = CreateContext();
        await dbContext.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await container.DisposeAsync();
    }

    public PlaygroundDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<PlaygroundDbContext>()
            .UseNpgsql(container.GetConnectionString())
            .Options;

        return new PlaygroundDbContext(options);
    }
}
