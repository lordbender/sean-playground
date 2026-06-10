using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SeansPlayground.Core.Nasa;

namespace SeansPlayground.Core.Data;

public sealed class NasaApodImageConfiguration : IEntityTypeConfiguration<NasaApodImage>
{
    public void Configure(EntityTypeBuilder<NasaApodImage> builder)
    {
        builder.ToTable("apod_images", "nasa");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.ApodDate).HasColumnName("apod_date").HasColumnType("date");
        builder.Property(item => item.Title).HasColumnName("title").IsRequired();
        builder.Property(item => item.Explanation).HasColumnName("explanation").IsRequired();
        builder.Property(item => item.Copyright).HasColumnName("copyright");
        builder.Property(item => item.MediaType).HasColumnName("media_type").IsRequired();
        builder.Property(item => item.SourceUrl).HasColumnName("source_url").IsRequired();
        builder.Property(item => item.HdUrl).HasColumnName("hd_url");
        builder.Property(item => item.ContentType).HasColumnName("content_type");
        builder.Property(item => item.ImageBytes).HasColumnName("image_bytes").HasColumnType("bytea");
        builder.Property(item => item.JsonPayload).HasColumnName("json_payload").HasColumnType("jsonb").IsRequired();
        builder.Property(item => item.FetchedAt).HasColumnName("fetched_at").HasDefaultValueSql("now()");

        builder.HasIndex(item => item.ApodDate).IsUnique();
    }
}
