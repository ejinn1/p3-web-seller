import { setAccessTokenProvider } from "@/lib/api/client";

const SESSION_STORAGE_KEY = "p3.cognito.session";
const STATE_STORAGE_KEY = "p3.cognito.state";
const VERIFIER_STORAGE_KEY = "p3.cognito.verifier";

type CognitoProvider = "kakao" | "google";

type CognitoSession = {
  accessToken: string;
  expiresAt: number;
  idToken: string;
  refreshToken?: string;
};

type CognitoTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
};

type CognitoConfiguration = {
  clientId: string;
  domain: string;
  googleProvider: string;
  kakaoProvider: string;
  redirectUri: string;
};

let refreshSessionPromise: Promise<CognitoSession> | null = null;

export class CognitoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CognitoError";
  }
}

export async function startCognitoSignIn(provider: CognitoProvider) {
  const configuration = getConfiguration();
  const state = createRandomValue();
  const verifier = createRandomValue();
  const challenge = await createCodeChallenge(verifier);

  window.sessionStorage.setItem(STATE_STORAGE_KEY, state);
  window.sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);

  const url = new URL("/oauth2/authorize", configuration.domain);
  url.search = new URLSearchParams({
    client_id: configuration.clientId,
    code_challenge: challenge,
    code_challenge_method: "S256",
    identity_provider:
      provider === "kakao"
        ? configuration.kakaoProvider
        : configuration.googleProvider,
    redirect_uri: configuration.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  }).toString();

  window.location.assign(url.toString());
}

export async function completeCognitoSignIn(searchParams: URLSearchParams) {
  const configuration = getConfiguration();
  const error = searchParams.get("error");

  if (error) {
    throw new CognitoError(searchParams.get("error_description") ?? error);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = window.sessionStorage.getItem(STATE_STORAGE_KEY);
  const verifier = window.sessionStorage.getItem(VERIFIER_STORAGE_KEY);

  if (
    !code ||
    !state ||
    !expectedState ||
    state !== expectedState ||
    !verifier
  ) {
    throw new CognitoError(
      "로그인 요청을 확인할 수 없습니다. 다시 시도해 주세요.",
    );
  }

  const response = await fetch(new URL("/oauth2/token", configuration.domain), {
    body: new URLSearchParams({
      client_id: configuration.clientId,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: configuration.redirectUri,
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as
    | CognitoTokenResponse
    | { error?: string; error_description?: string }
    | null;

  if (!response.ok || !payload || !("id_token" in payload)) {
    throw new CognitoError(
      payload && "error_description" in payload && payload.error_description
        ? payload.error_description
        : "Cognito 토큰을 가져오지 못했습니다.",
    );
  }

  const session = toSession(payload);
  saveSession(session);
  clearLoginRequest();
  setCognitoTokenProvider();

  return session;
}

export function setCognitoTokenProvider() {
  setAccessTokenProvider(getApiToken);
}

export function clearCognitoSession() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  setAccessTokenProvider();
}

export function hasCognitoSession() {
  return readSession() !== null;
}

async function getApiToken({
  forceRefresh = false,
}: { forceRefresh?: boolean } = {}) {
  const session = readSession();

  if (!session) {
    return null;
  }

  if (!forceRefresh && session.expiresAt > Date.now() + 30_000) {
    return session.idToken;
  }

  if (!session.refreshToken) {
    clearCognitoSession();
    return null;
  }

  const refreshedSession = await refreshSessionOnce(session.refreshToken);
  return refreshedSession.idToken;
}

function refreshSessionOnce(refreshToken: string) {
  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshSession(refreshToken).finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

async function refreshSession(refreshToken: string) {
  const configuration = getConfiguration();
  const response = await fetch(new URL("/oauth2/token", configuration.domain), {
    body: new URLSearchParams({
      client_id: configuration.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | CognitoTokenResponse
    | { error?: string; error_description?: string }
    | null;

  if (!response.ok || !payload || !("id_token" in payload)) {
    clearCognitoSession();
    throw new CognitoError(
      "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
    );
  }

  const session = toSession(payload, refreshToken);
  saveSession(session);
  return session;
}

function getConfiguration(): CognitoConfiguration {
  const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;

  if (!domain || !clientId || !redirectUri) {
    throw new CognitoError("Cognito 로그인 환경 변수가 설정되지 않았습니다.");
  }

  return {
    clientId,
    domain: domain.endsWith("/") ? domain : `${domain}/`,
    googleProvider: process.env.NEXT_PUBLIC_COGNITO_GOOGLE_PROVIDER ?? "Google",
    kakaoProvider: process.env.NEXT_PUBLIC_COGNITO_KAKAO_PROVIDER ?? "Kakao",
    redirectUri,
  };
}

function toSession(
  response: CognitoTokenResponse,
  refreshToken?: string,
): CognitoSession {
  return {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1_000,
    idToken: response.id_token,
    refreshToken: response.refresh_token ?? refreshToken,
  };
}

function saveSession(session: CognitoSession) {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readSession(): CognitoSession | null {
  const serialized = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!serialized) {
    return null;
  }

  try {
    return JSON.parse(serialized) as CognitoSession;
  } catch {
    clearCognitoSession();
    return null;
  }
}

function clearLoginRequest() {
  window.sessionStorage.removeItem(STATE_STORAGE_KEY);
  window.sessionStorage.removeItem(VERIFIER_STORAGE_KEY);
}

function createRandomValue() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createCodeChallenge(verifier: string) {
  const bytes = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return toBase64Url(new Uint8Array(digest));
}

function toBase64Url(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) {
    value += String.fromCharCode(byte);
  }
  return window
    .btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
