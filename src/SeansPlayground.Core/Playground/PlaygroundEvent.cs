namespace SeansPlayground.Core.Playground;

public sealed class PlaygroundEvent
{
    public long Id { get; set; }

    public string EventName { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
}
