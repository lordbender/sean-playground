namespace SeansPlayground.Contracts;

public sealed record SystemStatusResponse(
    string Application,
    string Environment,
    string Database,
    string IdentityProvider,
    DateTimeOffset Timestamp);

