import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const authority = import.meta.env.VITE_KEYCLOAK_AUTHORITY ?? "http://localhost:8080/realms/seans-playground";
export const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "seans-playground-web";
export const keycloakAdminUrl =
  import.meta.env.VITE_KEYCLOAK_ADMIN_URL ?? "http://localhost:8080/admin/seans-playground/console/";

export function createRegistrationUrl() {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid profile email",
    redirect_uri: `${window.location.origin}/`
  });

  return `${authority}/protocol/openid-connect/registrations?${params.toString()}`;
}

export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: "code",
  scope: "openid profile email",
  userStore: new WebStorageStateStore({ store: window.localStorage })
});
