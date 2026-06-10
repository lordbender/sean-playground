namespace SeansPlayground.Contracts.Registration;

public sealed record UserRegistrationResponse(
    bool Succeeded,
    string Message,
    string? Username = null);
