using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SeansPlayground.Core.Migrations;

public partial class AddNasaDashboardData : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.EnsureSchema(
            name: "nasa");

        migrationBuilder.CreateTable(
            name: "apod_images",
            schema: "nasa",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                apod_date = table.Column<DateOnly>(type: "date", nullable: false),
                title = table.Column<string>(type: "text", nullable: false),
                explanation = table.Column<string>(type: "text", nullable: false),
                copyright = table.Column<string>(type: "text", nullable: true),
                media_type = table.Column<string>(type: "text", nullable: false),
                source_url = table.Column<string>(type: "text", nullable: false),
                hd_url = table.Column<string>(type: "text", nullable: true),
                content_type = table.Column<string>(type: "text", nullable: true),
                image_bytes = table.Column<byte[]>(type: "bytea", nullable: true),
                json_payload = table.Column<string>(type: "jsonb", nullable: false),
                fetched_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_apod_images", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "donki_events",
            schema: "nasa",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                event_type = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                external_id = table.Column<string>(type: "text", nullable: false),
                occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                event_date = table.Column<DateOnly>(type: "date", nullable: false),
                json_payload = table.Column<string>(type: "jsonb", nullable: false),
                fetched_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_donki_events", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_apod_images_apod_date",
            schema: "nasa",
            table: "apod_images",
            column: "apod_date",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_donki_events_event_type_event_date",
            schema: "nasa",
            table: "donki_events",
            columns: new[] { "event_type", "event_date" });

        migrationBuilder.CreateIndex(
            name: "ix_donki_events_event_type_external_id",
            schema: "nasa",
            table: "donki_events",
            columns: new[] { "event_type", "external_id" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "apod_images",
            schema: "nasa");

        migrationBuilder.DropTable(
            name: "donki_events",
            schema: "nasa");
    }
}
