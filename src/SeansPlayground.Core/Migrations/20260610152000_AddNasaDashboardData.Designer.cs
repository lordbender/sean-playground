using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using SeansPlayground.Core.Data;

#nullable disable

namespace SeansPlayground.Core.Migrations;

[DbContext(typeof(PlaygroundDbContext))]
[Migration("20260610152000_AddNasaDashboardData")]
partial class AddNasaDashboardData
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasDefaultSchema("public")
            .HasAnnotation("ProductVersion", "10.0.0")
            .HasAnnotation("Relational:MaxIdentifierLength", 63);

        NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

        modelBuilder.Entity("SeansPlayground.Core.Nasa.NasaApodImage", b =>
            {
                b.Property<long>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("bigint")
                    .HasColumnName("id");

                NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                b.Property<DateOnly>("ApodDate")
                    .HasColumnType("date")
                    .HasColumnName("apod_date");

                b.Property<string>("ContentType")
                    .HasColumnType("text")
                    .HasColumnName("content_type");

                b.Property<string>("Copyright")
                    .HasColumnType("text")
                    .HasColumnName("copyright");

                b.Property<string>("Explanation")
                    .IsRequired()
                    .HasColumnType("text")
                    .HasColumnName("explanation");

                b.Property<DateTimeOffset>("FetchedAt")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("timestamp with time zone")
                    .HasColumnName("fetched_at")
                    .HasDefaultValueSql("now()");

                b.Property<string>("HdUrl")
                    .HasColumnType("text")
                    .HasColumnName("hd_url");

                b.Property<byte[]>("ImageBytes")
                    .HasColumnType("bytea")
                    .HasColumnName("image_bytes");

                b.Property<string>("JsonPayload")
                    .IsRequired()
                    .HasColumnType("jsonb")
                    .HasColumnName("json_payload");

                b.Property<string>("MediaType")
                    .IsRequired()
                    .HasColumnType("text")
                    .HasColumnName("media_type");

                b.Property<string>("SourceUrl")
                    .IsRequired()
                    .HasColumnType("text")
                    .HasColumnName("source_url");

                b.Property<string>("Title")
                    .IsRequired()
                    .HasColumnType("text")
                    .HasColumnName("title");

                b.HasKey("Id");

                b.HasIndex("ApodDate")
                    .IsUnique();

                b.ToTable("apod_images", "nasa");
            });

        modelBuilder.Entity("SeansPlayground.Core.Nasa.NasaDonkiEvent", b =>
            {
                b.Property<long>("Id")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("bigint")
                    .HasColumnName("id");

                NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                b.Property<DateOnly>("EventDate")
                    .HasColumnType("date")
                    .HasColumnName("event_date");

                b.Property<string>("EventType")
                    .IsRequired()
                    .HasMaxLength(16)
                    .HasColumnType("character varying(16)")
                    .HasColumnName("event_type");

                b.Property<string>("ExternalId")
                    .IsRequired()
                    .HasColumnType("text")
                    .HasColumnName("external_id");

                b.Property<DateTimeOffset>("FetchedAt")
                    .ValueGeneratedOnAdd()
                    .HasColumnType("timestamp with time zone")
                    .HasColumnName("fetched_at")
                    .HasDefaultValueSql("now()");

                b.Property<string>("JsonPayload")
                    .IsRequired()
                    .HasColumnType("jsonb")
                    .HasColumnName("json_payload");

                b.Property<DateTimeOffset?>("OccurredAt")
                    .HasColumnType("timestamp with time zone")
                    .HasColumnName("occurred_at");

                b.HasKey("Id");

                b.HasIndex("EventType", "EventDate");

                b.HasIndex("EventType", "ExternalId")
                    .IsUnique();

                b.ToTable("donki_events", "nasa");
            });
#pragma warning restore 612, 618
    }
}
