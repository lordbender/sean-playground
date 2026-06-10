using Npgsql;
using SeansPlayground.Contracts.Background;
using SeansPlayground.Core.Background;

namespace SeansPlayground.Services.Background;

public sealed class BackgroundService(NpgsqlDataSource dataSource) : IBackgroundService
{
    public async Task<BackgroundResponse?> GetBackgroundAsync(
        IReadOnlyCollection<string> userRoles,
        CancellationToken cancellationToken)
    {
        var allowedRoles = await GetAllowedRolesAsync(cancellationToken);

        if (!allowedRoles.Any(userRoles.Contains))
        {
            return null;
        }

        var profile = await GetProfileAsync(cancellationToken)
            ?? throw new InvalidOperationException("Background profile seed data is missing.");

        var document = await GetDocumentAsync(profile.Id, cancellationToken)
            ?? throw new InvalidOperationException("Background document seed data is missing.");

        var sections = await GetDocumentSectionsAsync(document.Id, cancellationToken);
        var experiences = await GetExperiencesAsync(profile.Id, cancellationToken);
        var education = await GetEducationAsync(profile.Id, cancellationToken);
        var socialLinks = await GetSocialLinksAsync(profile.Id, cancellationToken);
        var repositories = await GetRepositoriesAsync(profile.Id, cancellationToken);

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

    private async Task<IReadOnlyCollection<string>> GetAllowedRolesAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select role_name
            from background.section_entitlements
            where section_key = @section_key
            order by role_name;
            """;

        var roles = new List<string>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("section_key", BackgroundConstants.SectionKey);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            roles.Add(reader.GetString(0));
        }

        return roles;
    }

    private async Task<ProfileRecord?> GetProfileAsync(CancellationToken cancellationToken)
    {
        const string sql = """
            select id, display_name, headline, location, biography
            from background.profiles
            where slug = @slug;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("slug", BackgroundConstants.ProfileSlug);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new ProfileRecord(
            reader.GetInt64(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetString(3),
            reader.GetString(4));
    }

    private async Task<DocumentRecord?> GetDocumentAsync(long profileId, CancellationToken cancellationToken)
    {
        const string sql = """
            select id, title, source_file_name, content_type
            from background.documents
            where profile_id = @profile_id
            order by created_at desc
            limit 1;
            """;

        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("profile_id", profileId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new DocumentRecord(
            reader.GetInt64(0),
            reader.GetString(1),
            reader.GetString(2),
            reader.GetString(3));
    }

    private async Task<IReadOnlyCollection<BackgroundDocumentSectionDto>> GetDocumentSectionsAsync(
        long documentId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            select heading, body
            from background.document_sections
            where document_id = @document_id
            order by section_order;
            """;

        var sections = new List<BackgroundDocumentSectionDto>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("document_id", documentId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            sections.Add(new BackgroundDocumentSectionDto(reader.GetString(0), reader.GetString(1)));
        }

        return sections;
    }

    private async Task<IReadOnlyCollection<BackgroundExperienceDto>> GetExperiencesAsync(
        long profileId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            select
                e.role_title,
                e.organization_name,
                e.location,
                e.date_label,
                e.duration_label,
                coalesce(array_agg(h.highlight_text order by h.sort_order) filter (where h.id is not null), '{}') as highlights
            from background.experiences e
            left join background.experience_highlights h on h.experience_id = e.id
            where e.profile_id = @profile_id
            group by e.id
            order by e.sort_order;
            """;

        var experiences = new List<BackgroundExperienceDto>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("profile_id", profileId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            experiences.Add(new BackgroundExperienceDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.IsDBNull(2) ? null : reader.GetString(2),
                reader.GetString(3),
                reader.IsDBNull(4) ? null : reader.GetString(4),
                reader.GetFieldValue<string[]>(5)));
        }

        return experiences;
    }

    private async Task<IReadOnlyCollection<BackgroundEducationDto>> GetEducationAsync(
        long profileId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            select institution_name, degree_name, field_of_study, note
            from background.education_items
            where profile_id = @profile_id
            order by sort_order;
            """;

        var education = new List<BackgroundEducationDto>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("profile_id", profileId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            education.Add(new BackgroundEducationDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.IsDBNull(2) ? null : reader.GetString(2),
                reader.IsDBNull(3) ? null : reader.GetString(3)));
        }

        return education;
    }

    private async Task<IReadOnlyCollection<BackgroundSocialLinkDto>> GetSocialLinksAsync(
        long profileId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            select sp.name, sl.display_text, sl.url, sl.is_active
            from background.social_links sl
            join background.social_platforms sp on sp.id = sl.platform_id
            where sl.profile_id = @profile_id
            order by sl.sort_order;
            """;

        var links = new List<BackgroundSocialLinkDto>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("profile_id", profileId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            links.Add(new BackgroundSocialLinkDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetBoolean(3)));
        }

        return links;
    }

    private async Task<IReadOnlyCollection<BackgroundRepositoryDto>> GetRepositoriesAsync(
        long profileId,
        CancellationToken cancellationToken)
    {
        const string sql = """
            select owner_name, repository_name, url, description, is_featured
            from background.repositories
            where profile_id = @profile_id
            order by sort_order;
            """;

        var repositories = new List<BackgroundRepositoryDto>();
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue("profile_id", profileId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            repositories.Add(new BackgroundRepositoryDto(
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetBoolean(4)));
        }

        return repositories;
    }

    private sealed record ProfileRecord(long Id, string DisplayName, string Headline, string Location, string Biography);

    private sealed record DocumentRecord(long Id, string Title, string SourceFileName, string ContentType);
}
