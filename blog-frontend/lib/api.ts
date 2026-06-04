import { getAccessToken, refreshAccessToken, clearTokens } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}

export class AuthError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    try {
      await refreshAccessToken();
      throw new AuthError(); // signal caller to retry
    } catch (e) {
      if (e instanceof AuthError) throw e;
      clearTokens();
      throw new AuthError();
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Unknown error");
  }

  return res.json();
}

async function fetchWithRetry(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      clearTokens();
      throw new AuthError();
    }
  }

  return res;
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const urlObj = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") urlObj.searchParams.set(k, v);
    });
  }

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(urlObj.toString(), { headers });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const res = await fetchWithRetry(path, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const res = await fetchWithRetry(path, {
    method: "PUT",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetchWithRetry(path, { method: "DELETE" });
  if (!res.ok) {
    if (res.status === 401) {
      clearTokens();
      throw new AuthError();
    }
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Unknown error");
  }
}
