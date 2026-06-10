using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SeansPlayground.Core.Background;

namespace SeansPlayground.Core.Data;

public sealed class BackgroundProfileConfiguration : IEntityTypeConfiguration<BackgroundProfile>
{
    public void Configure(EntityTypeBuilder<BackgroundProfile> builder)
    {
        builder.ToTable("profiles", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.Slug).HasColumnName("slug").IsRequired();
        builder.Property(item => item.DisplayName).HasColumnName("display_name").IsRequired();
        builder.Property(item => item.Headline).HasColumnName("headline").IsRequired();
        builder.Property(item => item.Location).HasColumnName("location").IsRequired();
        builder.Property(item => item.Biography).HasColumnName("biography").IsRequired();
        builder.Property(item => item.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
        builder.Property(item => item.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("now()");

        builder.HasIndex(item => item.Slug).IsUnique();
    }
}

public sealed class BackgroundDocumentConfiguration : IEntityTypeConfiguration<BackgroundDocument>
{
    public void Configure(EntityTypeBuilder<BackgroundDocument> builder)
    {
        builder.ToTable("documents", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ProfileId).HasColumnName("profile_id");
        builder.Property(item => item.Title).HasColumnName("title").IsRequired();
        builder.Property(item => item.SourceFileName).HasColumnName("source_file_name").IsRequired();
        builder.Property(item => item.ContentType).HasColumnName("content_type").IsRequired();
        builder.Property(item => item.PlainText).HasColumnName("plain_text").IsRequired();
        builder.Property(item => item.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

        builder
            .HasOne(item => item.Profile)
            .WithMany(profile => profile.Documents)
            .HasForeignKey(item => item.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.ProfileId, item.Title }).IsUnique();
    }
}

public sealed class BackgroundDocumentSectionConfiguration : IEntityTypeConfiguration<BackgroundDocumentSection>
{
    public void Configure(EntityTypeBuilder<BackgroundDocumentSection> builder)
    {
        builder.ToTable("document_sections", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.DocumentId).HasColumnName("document_id");
        builder.Property(item => item.Heading).HasColumnName("heading").IsRequired();
        builder.Property(item => item.Body).HasColumnName("body").IsRequired();
        builder.Property(item => item.SectionOrder).HasColumnName("section_order");

        builder
            .HasOne(item => item.Document)
            .WithMany(document => document.Sections)
            .HasForeignKey(item => item.DocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.DocumentId, item.Heading }).IsUnique();
    }
}

public sealed class BackgroundExperienceConfiguration : IEntityTypeConfiguration<BackgroundExperience>
{
    public void Configure(EntityTypeBuilder<BackgroundExperience> builder)
    {
        builder.ToTable("experiences", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ProfileId).HasColumnName("profile_id");
        builder.Property(item => item.RoleTitle).HasColumnName("role_title").IsRequired();
        builder.Property(item => item.OrganizationName).HasColumnName("organization_name").IsRequired();
        builder.Property(item => item.Location).HasColumnName("location");
        builder.Property(item => item.StartOn).HasColumnName("start_on").HasColumnType("date");
        builder.Property(item => item.EndOn).HasColumnName("end_on").HasColumnType("date");
        builder.Property(item => item.DateLabel).HasColumnName("date_label").IsRequired();
        builder.Property(item => item.DurationLabel).HasColumnName("duration_label");
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder
            .HasOne(item => item.Profile)
            .WithMany(profile => profile.Experiences)
            .HasForeignKey(item => item.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.ProfileId, item.OrganizationName, item.RoleTitle, item.StartOn }).IsUnique();
    }
}

public sealed class BackgroundExperienceHighlightConfiguration : IEntityTypeConfiguration<BackgroundExperienceHighlight>
{
    public void Configure(EntityTypeBuilder<BackgroundExperienceHighlight> builder)
    {
        builder.ToTable("experience_highlights", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ExperienceId).HasColumnName("experience_id");
        builder.Property(item => item.HighlightText).HasColumnName("highlight_text").IsRequired();
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder
            .HasOne(item => item.Experience)
            .WithMany(experience => experience.Highlights)
            .HasForeignKey(item => item.ExperienceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.ExperienceId, item.SortOrder }).IsUnique();
    }
}

public sealed class BackgroundEducationItemConfiguration : IEntityTypeConfiguration<BackgroundEducationItem>
{
    public void Configure(EntityTypeBuilder<BackgroundEducationItem> builder)
    {
        builder.ToTable("education_items", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ProfileId).HasColumnName("profile_id");
        builder.Property(item => item.InstitutionName).HasColumnName("institution_name").IsRequired();
        builder.Property(item => item.DegreeName).HasColumnName("degree_name").IsRequired();
        builder.Property(item => item.FieldOfStudy).HasColumnName("field_of_study");
        builder.Property(item => item.Note).HasColumnName("note");
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder
            .HasOne(item => item.Profile)
            .WithMany(profile => profile.EducationItems)
            .HasForeignKey(item => item.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.ProfileId, item.DegreeName, item.InstitutionName }).IsUnique();
    }
}

public sealed class BackgroundSocialPlatformConfiguration : IEntityTypeConfiguration<BackgroundSocialPlatform>
{
    public void Configure(EntityTypeBuilder<BackgroundSocialPlatform> builder)
    {
        builder.ToTable("social_platforms", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.Name).HasColumnName("name").IsRequired();
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder.HasIndex(item => item.Name).IsUnique();
    }
}

public sealed class BackgroundSocialLinkConfiguration : IEntityTypeConfiguration<BackgroundSocialLink>
{
    public void Configure(EntityTypeBuilder<BackgroundSocialLink> builder)
    {
        builder.ToTable("social_links", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ProfileId).HasColumnName("profile_id");
        builder.Property(item => item.PlatformId).HasColumnName("platform_id");
        builder.Property(item => item.DisplayText).HasColumnName("display_text").IsRequired();
        builder.Property(item => item.Url).HasColumnName("url").IsRequired();
        builder.Property(item => item.IsActive).HasColumnName("is_active").HasDefaultValue(true);
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder
            .HasOne(item => item.Profile)
            .WithMany(profile => profile.SocialLinks)
            .HasForeignKey(item => item.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(item => item.Platform)
            .WithMany(platform => platform.Links)
            .HasForeignKey(item => item.PlatformId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(item => new { item.ProfileId, item.PlatformId, item.Url }).IsUnique();
    }
}

public sealed class BackgroundRepositoryConfiguration : IEntityTypeConfiguration<BackgroundRepository>
{
    public void Configure(EntityTypeBuilder<BackgroundRepository> builder)
    {
        builder.ToTable("repositories", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ProfileId).HasColumnName("profile_id");
        builder.Property(item => item.OwnerName).HasColumnName("owner_name").IsRequired();
        builder.Property(item => item.RepositoryName).HasColumnName("repository_name").IsRequired();
        builder.Property(item => item.Url).HasColumnName("url").IsRequired();
        builder.Property(item => item.Description).HasColumnName("description").IsRequired();
        builder.Property(item => item.IsFeatured).HasColumnName("is_featured").HasDefaultValue(false);
        builder.Property(item => item.SortOrder).HasColumnName("sort_order");

        builder
            .HasOne(item => item.Profile)
            .WithMany(profile => profile.Repositories)
            .HasForeignKey(item => item.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(item => new { item.OwnerName, item.RepositoryName }).IsUnique();
    }
}

public sealed class BackgroundSectionEntitlementConfiguration : IEntityTypeConfiguration<BackgroundSectionEntitlement>
{
    public void Configure(EntityTypeBuilder<BackgroundSectionEntitlement> builder)
    {
        builder.ToTable("section_entitlements", "background");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.SectionKey).HasColumnName("section_key").IsRequired();
        builder.Property(item => item.RoleName).HasColumnName("role_name").IsRequired();

        builder.HasIndex(item => new { item.SectionKey, item.RoleName }).IsUnique();
    }
}
