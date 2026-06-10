using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Background;
using SeansPlayground.Core.Nasa;
using SeansPlayground.Core.Playground;

namespace SeansPlayground.Core.Data;

public sealed class PlaygroundDbContext(DbContextOptions<PlaygroundDbContext> options) : DbContext(options)
{
    public DbSet<PlaygroundEvent> PlaygroundEvents => Set<PlaygroundEvent>();

    public DbSet<BackgroundProfile> BackgroundProfiles => Set<BackgroundProfile>();

    public DbSet<BackgroundDocument> BackgroundDocuments => Set<BackgroundDocument>();

    public DbSet<BackgroundDocumentSection> BackgroundDocumentSections => Set<BackgroundDocumentSection>();

    public DbSet<BackgroundExperience> BackgroundExperiences => Set<BackgroundExperience>();

    public DbSet<BackgroundExperienceHighlight> BackgroundExperienceHighlights => Set<BackgroundExperienceHighlight>();

    public DbSet<BackgroundEducationItem> BackgroundEducationItems => Set<BackgroundEducationItem>();

    public DbSet<BackgroundSocialPlatform> BackgroundSocialPlatforms => Set<BackgroundSocialPlatform>();

    public DbSet<BackgroundSocialLink> BackgroundSocialLinks => Set<BackgroundSocialLink>();

    public DbSet<BackgroundRepository> BackgroundRepositories => Set<BackgroundRepository>();

    public DbSet<BackgroundSectionEntitlement> BackgroundSectionEntitlements => Set<BackgroundSectionEntitlement>();

    public DbSet<NasaApodImage> NasaApodImages => Set<NasaApodImage>();

    public DbSet<NasaDonkiEvent> NasaDonkiEvents => Set<NasaDonkiEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("public");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlaygroundDbContext).Assembly);
    }
}
