using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Nasa;

namespace SeansPlayground.Core.Data;

public sealed class PlaygroundDbContext(DbContextOptions<PlaygroundDbContext> options) : DbContext(options)
{
    public DbSet<NasaApodImage> NasaApodImages => Set<NasaApodImage>();

    public DbSet<NasaDonkiEvent> NasaDonkiEvents => Set<NasaDonkiEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("public");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlaygroundDbContext).Assembly);
    }
}
