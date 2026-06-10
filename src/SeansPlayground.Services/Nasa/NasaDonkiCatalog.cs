namespace SeansPlayground.Services.Nasa;

public static class NasaDonkiCatalog
{
    public static readonly IReadOnlyCollection<NasaDonkiFeedDefinition> Feeds =
    [
        new("FLR", "Solar Flare", "#c91f6a"),
        new("IPS", "Interplanetary Shock", "#f2c14e"),
        new("GST", "Geomagnetic Storm", "#00843d"),
        new("CME", "Coronal Mass Ejection", "#5b1a8e")
    ];
}

public sealed record NasaDonkiFeedDefinition(string EventType, string DisplayName, string Accent);
