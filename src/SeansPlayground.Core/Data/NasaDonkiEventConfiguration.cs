using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SeansPlayground.Core.Nasa;

namespace SeansPlayground.Core.Data;

public sealed class NasaDonkiEventConfiguration : IEntityTypeConfiguration<NasaDonkiEvent>
{
    public void Configure(EntityTypeBuilder<NasaDonkiEvent> builder)
    {
        builder.ToTable("donki_events", "nasa");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.EventType).HasColumnName("event_type").HasMaxLength(16).IsRequired();
        builder.Property(item => item.ExternalId).HasColumnName("external_id").IsRequired();
        builder.Property(item => item.OccurredAt).HasColumnName("occurred_at");
        builder.Property(item => item.EventDate).HasColumnName("event_date").HasColumnType("date");
        builder.Property(item => item.JsonPayload).HasColumnName("json_payload").HasColumnType("jsonb").IsRequired();
        builder.Property(item => item.FetchedAt).HasColumnName("fetched_at").HasDefaultValueSql("now()");

        builder.HasIndex(item => new { item.EventType, item.ExternalId }).IsUnique();
        builder.HasIndex(item => new { item.EventType, item.EventDate });
    }
}
