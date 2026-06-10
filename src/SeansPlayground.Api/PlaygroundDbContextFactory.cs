using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SeansPlayground.Core.Data;

namespace SeansPlayground.Api;

public sealed class PlaygroundDbContextFactory : IDesignTimeDbContextFactory<PlaygroundDbContext>
{
    public PlaygroundDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? "Host=localhost;Port=5432;Database=seans_playground;Username=seans_playground;Password=seans_playground";

        var optionsBuilder = new DbContextOptionsBuilder<PlaygroundDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new PlaygroundDbContext(optionsBuilder.Options);
    }
}
