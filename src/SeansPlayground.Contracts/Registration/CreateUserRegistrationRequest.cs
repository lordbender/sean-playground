namespace SeansPlayground.Contracts.Registration;

public sealed record CreateUserRegistrationRequest(
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string Password);
