import { ApiError, type ApiErrorBody, type ApiResponse } from "@/lib/api/types";

type AccessTokenOptions = { forceRefresh?: boolean };
type AccessTokenProvider = (
  options?: AccessTokenOptions,
) => string | null | Promise<string | null>;

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: BodyInit | null;
  headers?: HeadersInit;
  requiresAuth?: boolean;
};

let accessTokenProvider: AccessTokenProvider | undefined;

export function setAccessTokenProvider(provider?: AccessTokenProvider) {
  accessTokenProvider = provider;
}

export async function getAccessToken(options?: AccessTokenOptions) {
  return accessTokenProvider?.(options) ?? null;
}

export async function apiRequest<T>(
  path: string,
  { body, headers, requiresAuth = true, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const request = async (forceRefresh = false) => {
    const requestHeaders = new Headers(headers);

    if (requiresAuth) {
      const accessToken = await getAccessToken({ forceRefresh });

      if (accessToken) {
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    return fetch(toApiUrl(path), {
      ...init,
      body,
      headers: requestHeaders,
    });
  };

  let response = await request();
  if (requiresAuth && response.status === 401) {
    response = await request(true);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    const error = payload?.error;
    throw new ApiError(
      error?.title ?? "요청을 처리하지 못했습니다.",
      response.status,
      error ?? undefined,
    );
  }

  return payload.data;
}

export function getJson<T>(path: string) {
  return apiRequest<T>(path);
}

export function sendJson<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
) {
  return apiRequest<T>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
  });
}

function toApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_P3_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_P3_API_BASE_URL is not configured.");
  }

  return new URL(path, `${baseUrl.replace(/\/$/, "")}/`).toString();
}

export type { ApiErrorBody };
