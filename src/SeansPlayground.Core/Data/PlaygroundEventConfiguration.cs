using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SeansPlayground.Core.Playground;

namespace SeansPlayground.Core.Data;

public sealed class PlaygroundEventConfiguration : IEntityTypeConfiguration<PlaygroundEvent>
{
    public void Configure(EntityTypeBuilder<PlaygroundEvent> builder)
    {
        builder.ToTable("playground_events", "public");

        builder.HasKey(item => item.Id);

        builder.Property(item => item.Id).HasColumnName("id");
        builder.Property(item => item.EventName).HasColumnName("event_name").IsRequired();
        builder.Property(item => item.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
    }
}
