using Microsoft.EntityFrameworkCore;
using SeansPlayground.Core.Background;
using SeansPlayground.Core.Data;
using SeansPlayground.Services.Background;

namespace SeansPlayground.Tests;

public sealed class BackgroundModelTests(PostgreSqlFixture fixture) : IClassFixture<PostgreSqlFixture>
{
    [Fact]
    public async Task MigrationsSeedExpectedBackgroundData()
    {
        await using var dbContext = fixture.CreateContext();

        var appliedMigrations = await dbContext.Database.GetAppliedMigrationsAsync();
        Assert.Contains("20260610205551_AddBackgroundAndPlaygroundModel", appliedMigrations);

        var profile = await dbContext.BackgroundProfiles.SingleAsync(item => item.Slug == BackgroundConstants.ProfileSlug);
        Assert.Equal("Sean Willison", profile.DisplayName);
        Assert.Equal("Senior Leader / Architect / Innovator", profile.Headline);

        var entitlements = await dbContext.BackgroundSectionEntitlements
            .Where(item => item.SectionKey == BackgroundConstants.SectionKey)
            .OrderBy(item => item.RoleName)
            .Select(item => item.RoleName)
            .ToArrayAsync();
        Assert.Equal(["Admins", "Friends", "Users"], entitlements);

        var document = await dbContext.BackgroundDocuments.SingleAsync(item => item.ProfileId == profile.Id && item.Title == "Current Resume");
        Assert.Equal("Sean Willison Current.docx", document.SourceFileName);

        var documentSections = await dbContext.BackgroundDocumentSections
            .Where(item => item.DocumentId == document.Id)
            .OrderBy(item => item.SectionOrder)
            .Select(item => item.Heading)
            .ToArrayAsync();
        Assert.Equal(["Professional Summary", "Regulated Domains"], documentSections);

        var socialLinks = await dbContext.BackgroundSocialLinks
            .Where(item => item.ProfileId == profile.Id)
            .Include(item => item.Platform)
            .OrderBy(item => item.SortOrder)
            .Select(item => new { PlatformName = item.Platform!.Name, item.DisplayText, item.Url, item.IsActive })
            .ToArrayAsync();
        Assert.Collection(
            socialLinks,
            item =>
            {
                Assert.Equal("LinkedIn", item.PlatformName);
                Assert.Equal("linkedin.com/in/swillison", item.DisplayText);
                Assert.Equal("https://www.linkedin.com/in/swillison", item.Url);
                Assert.True(item.IsActive);
            },
            item =>
            {
                Assert.Equal("Facebook", item.PlatformName);
                Assert.Equal("facebook.com/sean.willison.1", item.DisplayText);
                Assert.Equal("https://www.facebook.com/sean.willison.1/", item.Url);
                Assert.True(item.IsActive);
            });

        var repository = await dbContext.BackgroundRepositories.SingleAsync(item => item.ProfileId == profile.Id);
        Assert.Equal("lordbender", repository.OwnerName);
        Assert.Equal("sean-playground", repository.RepositoryName);
        Assert.True(repository.IsFeatured);

        Assert.Equal(16, await dbContext.BackgroundExperiences.CountAsync(item => item.ProfileId == profile.Id));
        Assert.Equal(2, await dbContext.BackgroundEducationItems.CountAsync(item => item.ProfileId == profile.Id));
    }

    [Fact]
    public async Task BackgroundServiceReturnsResponseForExplicitlyAllowedRole()
    {
        await using var dbContext = fixture.CreateContext();
        var service = new BackgroundService(dbContext);

        var response = await service.GetBackgroundAsync(["Users"], CancellationToken.None);

        Assert.NotNull(response);
        Assert.Equal(BackgroundConstants.SectionKey, response.SectionKey);
        Assert.Equal("Sean Willison", response.Profile.DisplayName);
        Assert.Contains("Users", response.AllowedRoles);
        Assert.Contains(response.SocialLinks, item => item.PlatformName == "LinkedIn" && item.Url == "https://www.linkedin.com/in/swillison");
        Assert.Contains(response.SocialLinks, item => item.PlatformName == "Facebook" && item.Url == "https://www.facebook.com/sean.willison.1/");
        Assert.Contains(response.Repositories, item => item.OwnerName == "lordbender" && item.RepositoryName == "sean-playground");
        Assert.Equal(16, response.Experiences.Count);
        Assert.Equal(2, response.Education.Count);
    }

    [Fact]
    public async Task BackgroundServiceReturnsNullForRoleWithoutEntitlement()
    {
        await using var dbContext = fixture.CreateContext();
        var service = new BackgroundService(dbContext);

        var response = await service.GetBackgroundAsync(["Guests"], CancellationToken.None);

        Assert.Null(response);
    }
}
