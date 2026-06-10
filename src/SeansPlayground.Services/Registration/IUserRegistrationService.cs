using SeansPlayground.Contracts.Registration;

namespace SeansPlayground.Services.Registration;

public interface IUserRegistrationService
{
    Task<UserRegistrationResponse> CreateUserAsync(CreateUserRegistrationRequest request, CancellationToken cancellationToken);
}
