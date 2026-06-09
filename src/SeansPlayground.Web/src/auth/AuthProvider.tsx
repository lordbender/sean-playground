import { User } from "oidc-client-ts";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createRegistrationUrl, userManager } from "./authConfig";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  register: () => void;
  signOut: () => Promise<void>;
  completeSignIn: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    userManager.getUser().then((storedUser) => {
      if (storedUser && !storedUser.expired) {
        setUser(storedUser);
      }
    });
  }, []);

  const signIn = useCallback(() => userManager.signinRedirect(), []);

  const register = useCallback(() => {
    window.location.assign(createRegistrationUrl());
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await userManager.signoutRedirect();
  }, []);

  const completeSignIn = useCallback(async () => {
    const signedInUser = await userManager.signinRedirectCallback();
    setUser(signedInUser);
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && !user.expired),
      isAdmin: hasRealmRole(user, "Admins"),
      signIn,
      register,
      signOut,
      completeSignIn
    }),
    [completeSignIn, register, signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function hasRealmRole(user: User | null, role: string) {
  if (!user || user.expired) {
    return false;
  }

  return getRealmRoles(user).includes(role);
}

function getRealmRoles(user: User) {
  const profileRoles = readRealmRoles(user.profile.realm_access);

  if (profileRoles.length > 0) {
    return profileRoles;
  }

  return readRealmRoles(readJwtPayload(user.access_token)?.realm_access);
}

function readRealmRoles(value: unknown) {
  if (!value || typeof value !== "object" || !("roles" in value)) {
    return [];
  }

  const roles = (value as { roles?: unknown }).roles;

  return Array.isArray(roles) ? roles.filter((item): item is string => typeof item === "string") : [];
}

function readJwtPayload(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");

    return JSON.parse(window.atob(paddedPayload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
