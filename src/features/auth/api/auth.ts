import { backendApi } from "@/shared/api/clients";
import type { AuthSession, LoginInput, RegisterInput } from "../types";

type BackendIdentity = {
  user_id: string;
  display_name: string;
  created_at: string;
};

type BackendAccessToken = {
  access_token: string;
  expires_in: number;
  token_type: "bearer";
};

type BackendCurrentUser = BackendIdentity & {
  email: string;
  bio: string | null;
  avatar_id: string | null;
  avatar_image_url: string | null;
  background_image_url: string | null;
};

export async function registerAccount(input: RegisterInput): Promise<BackendIdentity> {
  return backendApi.request<BackendIdentity>("/api/v1/auth/register", {
    method: "POST",
    skipAuth: true,
    body: {
      display_name: input.displayName,
      email: input.email,
      password: input.password,
    },
    networkMessage: "Não foi possível criar sua conta. Verifique sua conexão.",
  });
}

export async function loginAccount(input: LoginInput): Promise<AuthSession> {
  const token = await backendApi.request<BackendAccessToken>("/api/v1/auth/login", {
    method: "POST",
    skipAuth: true,
    body: {
      email: input.email,
      password: input.password,
    },
    networkMessage: "Não foi possível entrar. Verifique sua conexão.",
  });

  const current = await backendApi.request<BackendCurrentUser>("/api/v1/auth/me", {
    skipAuth: true,
    headers: { Authorization: `Bearer ${token.access_token}` },
  });

  return {
    accessToken: token.access_token,
    expiresIn: token.expires_in,
    viewer: {
      userId: current.user_id,
      displayName: current.display_name,
    },
  };
}
