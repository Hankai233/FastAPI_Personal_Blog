import type { TokenResponse } from "@/types";

const TOKEN_KEY = "blog_tokens";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const tokens: TokenResponse = JSON.parse(raw);
    return tokens.access_token;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const tokens: TokenResponse = JSON.parse(raw);
    return tokens.refresh_token;
  } catch {
    return null;
  }
}

export function setTokens(tokens: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasTokens(): boolean {
  return getAccessToken() !== null;
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }

  const data: TokenResponse = await res.json();
  setTokens(data);
  return data.access_token;
}
