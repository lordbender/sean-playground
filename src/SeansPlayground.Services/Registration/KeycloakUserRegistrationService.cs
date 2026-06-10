using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using SeansPlayground.Contracts.Registration;

namespace SeansPlayground.Services.Registration;

public sealed class KeycloakUserRegistrationService(HttpClient httpClient, IConfiguration configuration) : IUserRegistrationService
{
    private const string DefaultRoleName = "Users";

    public async Task<UserRegistrationResponse> CreateUserAsync(
        CreateUserRegistrationRequest request,
        CancellationToken cancellationToken)
    {
        var validationMessage = Validate(request);

        if (validationMessage is not null)
        {
            return new UserRegistrationResponse(false, validationMessage);
        }

        var options = GetOptions();
        await GetAdminTokenAsync(options, cancellationToken);
        var normalizedUsername = request.Username.Trim();

        var createResponse = await httpClient.PostAsJsonAsync(
            $"/admin/realms/{Uri.EscapeDataString(options.Realm)}/users",
            new KeycloakCreateUserRequest(
                normalizedUsername,
                request.Email.Trim(),
                request.FirstName.Trim(),
                request.LastName.Trim(),
                true,
                true,
                [new KeycloakCredential("password", request.Password, false)]),
            cancellationToken);

        if (createResponse.StatusCode == HttpStatusCode.Conflict)
        {
            return new UserRegistrationResponse(false, "An account with that username or email already exists.");
        }

        if (!createResponse.IsSuccessStatusCode)
        {
            return new UserRegistrationResponse(false, "The account could not be created right now.");
        }

        var userId = await GetCreatedUserIdAsync(options, normalizedUsername, createResponse, cancellationToken);
        await AssignRealmRoleAsync(options, userId, DefaultRoleName, cancellationToken);

        return new UserRegistrationResponse(true, "Account created. You can sign in now.", normalizedUsername);

        async Task<string> GetAdminTokenAsync(KeycloakAdminOptions keycloakOptions, CancellationToken token)
        {
            var parameters = new Dictionary<string, string>
            {
                ["client_id"] = "admin-cli",
                ["grant_type"] = "password",
                ["username"] = keycloakOptions.Username,
                ["password"] = keycloakOptions.Password
            };

            using var tokenResponse = await httpClient.PostAsync(
                "/realms/master/protocol/openid-connect/token",
                new FormUrlEncodedContent(parameters),
                token);

            tokenResponse.EnsureSuccessStatusCode();

            var tokenPayload = await tokenResponse.Content.ReadFromJsonAsync<KeycloakTokenResponse>(cancellationToken: token)
                ?? throw new InvalidOperationException("Keycloak did not return an access token payload.");

            httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokenPayload.AccessToken);

            return tokenPayload.AccessToken;
        }
    }

    private async Task<string> GetCreatedUserIdAsync(
        KeycloakAdminOptions options,
        string username,
        HttpResponseMessage createResponse,
        CancellationToken cancellationToken)
    {
        var location = createResponse.Headers.Location?.ToString();
        var idFromLocation = location?.TrimEnd('/').Split('/').LastOrDefault();

        if (!string.IsNullOrWhiteSpace(idFromLocation))
        {
            return idFromLocation;
        }

        var users = await httpClient.GetFromJsonAsync<KeycloakUserSummary[]>(
            $"/admin/realms/{Uri.EscapeDataString(options.Realm)}/users?username={Uri.EscapeDataString(username)}&exact=true",
            cancellationToken);

        return users?.FirstOrDefault()?.Id
            ?? throw new InvalidOperationException("Created Keycloak user could not be found.");
    }

    private async Task AssignRealmRoleAsync(
        KeycloakAdminOptions options,
        string userId,
        string roleName,
        CancellationToken cancellationToken)
    {
        var role = await httpClient.GetFromJsonAsync<KeycloakRole>(
            $"/admin/realms/{Uri.EscapeDataString(options.Realm)}/roles/{Uri.EscapeDataString(roleName)}",
            cancellationToken)
            ?? throw new InvalidOperationException($"Keycloak role '{roleName}' could not be found.");

        using var response = await httpClient.PostAsJsonAsync(
            $"/admin/realms/{Uri.EscapeDataString(options.Realm)}/users/{Uri.EscapeDataString(userId)}/role-mappings/realm",
            new[] { role },
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }

    private KeycloakAdminOptions GetOptions()
    {
        var section = configuration.GetSection("KeycloakAdmin");
        var baseUrl = section["BaseUrl"] ?? throw new InvalidOperationException("KeycloakAdmin:BaseUrl is required.");
        var username = section["Username"] ?? throw new InvalidOperationException("KeycloakAdmin:Username is required.");
        var password = section["Password"] ?? throw new InvalidOperationException("KeycloakAdmin:Password is required.");
        var realm = section["Realm"] ?? "seans-playground";

        httpClient.BaseAddress = new Uri(baseUrl.TrimEnd('/'));

        return new KeycloakAdminOptions(baseUrl, realm, username, password);
    }

    private static string? Validate(CreateUserRegistrationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || request.Username.Trim().Length < 3)
        {
            return "Username must be at least 3 characters.";
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@', StringComparison.Ordinal))
        {
            return "Enter a valid email address.";
        }

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        {
            return "First and last name are required.";
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            return "Password must be at least 8 characters.";
        }

        return null;
    }

    private sealed record KeycloakAdminOptions(string BaseUrl, string Realm, string Username, string Password);

    private sealed record KeycloakTokenResponse([property: JsonPropertyName("access_token")] string AccessToken);

    private sealed record KeycloakCreateUserRequest(
        string Username,
        string Email,
        string FirstName,
        string LastName,
        bool Enabled,
        bool EmailVerified,
        IReadOnlyCollection<KeycloakCredential> Credentials);

    private sealed record KeycloakCredential(string Type, string Value, bool Temporary);

    private sealed record KeycloakUserSummary(string Id);

    private sealed record KeycloakRole(string Id, string Name);
}
