using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeansPlayground.Contracts.Registration;
using SeansPlayground.Services.Registration;

namespace SeansPlayground.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/registration")]
public sealed class RegistrationController(IUserRegistrationService registrationService) : ControllerBase
{
    [ProducesResponseType<UserRegistrationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<UserRegistrationResponse>(StatusCodes.Status400BadRequest)]
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(
        CreateUserRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var response = await registrationService.CreateUserAsync(request, cancellationToken);

        return response.Succeeded ? Ok(response) : BadRequest(response);
    }
}
