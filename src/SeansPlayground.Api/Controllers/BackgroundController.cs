using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SeansPlayground.Services.Background;

namespace SeansPlayground.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/background")]
public sealed class BackgroundController(IBackgroundService backgroundService) : ControllerBase
{
    [HttpGet("sean")]
    public async Task<IActionResult> GetSeanBackground(CancellationToken cancellationToken)
    {
        var background = await backgroundService.GetBackgroundAsync(GetRealmRoles(User), cancellationToken);

        return background is null ? Forbid() : Ok(background);
    }

    private static IReadOnlyCollection<string> GetRealmRoles(ClaimsPrincipal user)
    {
        var roles = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var role in user.FindAll(ClaimTypes.Role).Concat(user.FindAll("role")).Concat(user.FindAll("roles")))
        {
            roles.Add(role.Value);
        }

        var realmAccess = user.FindFirst("realm_access")?.Value;

        if (string.IsNullOrWhiteSpace(realmAccess))
        {
            return roles;
        }

        using var document = JsonDocument.Parse(realmAccess);

        if (!document.RootElement.TryGetProperty("roles", out var realmRoles) ||
            realmRoles.ValueKind != JsonValueKind.Array)
        {
            return roles;
        }

        foreach (var role in realmRoles.EnumerateArray())
        {
            if (role.ValueKind == JsonValueKind.String && role.GetString() is { } roleName)
            {
                roles.Add(roleName);
            }
        }

        return roles;
    }
}
