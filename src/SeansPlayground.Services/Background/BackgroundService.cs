using Microsoft.EntityFrameworkCore;
using SeansPlayground.Contracts.Background;
using SeansPlayground.Core.Background;
using SeansPlayground.Core.Data;

namespace SeansPlayground.Services.Background;

public sealed class BackgroundService(PlaygroundDbContext dbContext) : IBackgroundService
{
    public async Task<BackgroundResponse?> GetBackgroundAsync(
        IReadOnlyCollection<string> userRoles,
        CancellationToken cancellationToken)
    {
        var allowedRoles = await dbContext.BackgroundSectionEntitlements
            .AsNoTracking()
            .Where(item => item.SectionKey == BackgroundConstants.SectionKey)
            .OrderBy(item => item.RoleName)
            .Select(item => item.RoleName)
            .ToArrayAsync(cancellationToken);

        if (!allowedRoles.Any(userRoles.Contains))
        {
            return null;
        }

        var profile = await dbContext.BackgroundProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Slug == BackgroundConstants.ProfileSlug, cancellationToken)
            ?? throw new InvalidOperationException("Background profile seed data is missing.");

        var document = await dbContext.BackgroundDocuments
            .AsNoTracking()
            .Where(item => item.ProfileId == profile.Id)
            .OrderByDescending(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new InvalidOperationException("Background document seed data is missing.");

        var sections = await dbContext.BackgroundDocumentSections
            .AsNoTracking()
            .Where(item => item.DocumentId == document.Id)
            .OrderBy(item => item.SectionOrder)
            .Select(item => new BackgroundDocumentSectionDto(item.Heading, item.Body))
            .ToArrayAsync(cancellationToken);

        var experiences = await GetExperiencesAsync(profile.Id, cancellationToken);

        var education = await dbContext.BackgroundEducationItems
            .AsNoTracking()
            .Where(item => item.ProfileId == profile.Id)
            .OrderBy(item => item.SortOrder)
            .Select(item => new BackgroundEducationDto(
                item.InstitutionName,
                item.DegreeName,
                item.FieldOfStudy,
                item.Note))
            .ToArrayAsync(cancellationToken);

        var socialLinks = await dbContext.BackgroundSocialLinks
            .AsNoTracking()
            .Where(item => item.ProfileId == profile.Id)
            .OrderBy(item => item.SortOrder)
            .Select(item => new BackgroundSocialLinkDto(
                item.Platform!.Name,
                item.DisplayText,
                item.Url,
                item.IsActive))
            .ToArrayAsync(cancellationToken);

        var repositories = await dbContext.BackgroundRepositories
            .AsNoTracking()
            .Where(item => item.ProfileId == profile.Id)
            .OrderBy(item => item.SortOrder)
            .Select(item => new BackgroundRepositoryDto(
                item.OwnerName,
                item.RepositoryName,
                item.Url,
                item.Description,
                item.IsFeatured))
            .ToArrayAsync(cancellationToken);

        return new BackgroundResponse(
            BackgroundConstants.SectionKey,
            allowedRoles,
            new BackgroundProfileDto(profile.DisplayName, profile.Headline, profile.Location, profile.Biography),
            new BackgroundDocumentDto(document.Title, document.SourceFileName, document.ContentType, sections),
            experiences,
            education,
            socialLinks,
            repositories);
    }

    private async Task<IReadOnlyCollection<BackgroundExperienceDto>> GetExperiencesAsync(
        long profileId,
        CancellationToken cancellationToken)
    {
        var experiences = await dbContext.BackgroundExperiences
            .AsNoTracking()
            .Where(item => item.ProfileId == profileId)
            .OrderBy(item => item.SortOrder)
            .Select(item => new
            {
                item.Id,
                item.RoleTitle,
                item.OrganizationName,
                item.Location,
                item.DateLabel,
                item.DurationLabel
            })
            .ToArrayAsync(cancellationToken);

        var experienceIds = experiences.Select(item => item.Id).ToArray();
        var highlightRows = await dbContext.BackgroundExperienceHighlights
            .AsNoTracking()
            .Where(item => experienceIds.Contains(item.ExperienceId))
            .OrderBy(item => item.SortOrder)
            .Select(group => new
            {
                group.ExperienceId,
                group.HighlightText
            })
            .ToArrayAsync(cancellationToken);

        var highlights = highlightRows
            .GroupBy(item => item.ExperienceId)
            .ToDictionary(
                group => group.Key,
                group => group.Select(item => item.HighlightText).ToArray());

        return experiences
            .Select(item => new BackgroundExperienceDto(
                item.RoleTitle,
                item.OrganizationName,
                item.Location,
                item.DateLabel,
                item.DurationLabel,
                highlights.GetValueOrDefault(item.Id, [])))
            .ToArray();
    }
}
