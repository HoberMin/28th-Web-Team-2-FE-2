import "server-only";

import { z } from "zod";
import type { KakaoOAuthConfig } from "./kakao-oauth-config";

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_JWKS_URL = "https://kauth.kakao.com/.well-known/jwks.json";
const KAKAO_ISSUER = "https://kauth.kakao.com";
const KAKAO_REQUEST_TIMEOUT_MS = 10_000;
const CLOCK_SKEW_SECONDS = 60;

const tokenResponseSchema = z.object({ id_token: z.string().min(1) });
const jwtHeaderSchema = z.object({ alg: z.literal("RS256"), kid: z.string().min(1) });
const jwtClaimsSchema = z.object({
  aud: z.string().min(1),
  exp: z.number().int(),
  iat: z.number().int(),
  iss: z.literal(KAKAO_ISSUER),
  nonce: z.string().min(1),
  sub: z.string().min(1),
});
const jwkSchema = z.object({
  alg: z.literal("RS256"),
  e: z.string().min(1),
  kid: z.string().min(1),
  kty: z.literal("RSA"),
  n: z.string().min(1),
  use: z.literal("sig"),
});
const jwksSchema = z.object({ keys: z.array(jwkSchema).min(1) });

export type KakaoOAuthErrorKind = "exchange" | "jwks" | "token";

export class KakaoOAuthError extends Error {
  readonly kind: KakaoOAuthErrorKind;

  constructor(kind: KakaoOAuthErrorKind) {
    super(`카카오 OAuth 처리 실패: ${kind}`);
    this.name = "KakaoOAuthError";
    this.kind = kind;
  }
}

function decodeBase64Url(value: string): ArrayBuffer {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  } catch {
    throw new KakaoOAuthError("token");
  }
}

function decodeJsonPart(value: string): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as unknown;
  } catch (error) {
    if (error instanceof KakaoOAuthError) throw error;
    throw new KakaoOAuthError("token");
  }
}

export function createKakaoAuthorizationUrl(params: {
  config: KakaoOAuthConfig;
  nonce: string;
  state: string;
}): URL {
  const url = new URL(KAKAO_AUTHORIZE_URL);
  url.searchParams.set("client_id", params.config.restKey);
  url.searchParams.set("redirect_uri", params.config.redirectUri.toString());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  return url;
}

export function createOAuthRandomValue(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function exchangeKakaoCode(params: {
  code: string;
  config: KakaoOAuthConfig;
}): Promise<string> {
  const body = new URLSearchParams({
    client_id: params.config.restKey,
    client_secret: params.config.clientSecret,
    code: params.code,
    grant_type: "authorization_code",
    redirect_uri: params.config.redirectUri.toString(),
  });

  let response: Response;
  try {
    response = await fetch(KAKAO_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(KAKAO_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new KakaoOAuthError("exchange");
  }

  if (!response.ok) throw new KakaoOAuthError("exchange");

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new KakaoOAuthError("exchange");
  }
  const parsed = tokenResponseSchema.safeParse(payload);
  if (!parsed.success) throw new KakaoOAuthError("exchange");
  return parsed.data.id_token;
}

async function getKakaoJwks(cachePolicy: "cached" | "fresh"): Promise<z.infer<typeof jwksSchema>> {
  let response: Response;
  try {
    response = await fetch(KAKAO_JWKS_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      ...(cachePolicy === "fresh" ? { cache: "no-store" as const } : { next: { revalidate: 3_600 } }),
      signal: AbortSignal.timeout(KAKAO_REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new KakaoOAuthError("jwks");
  }
  if (!response.ok) throw new KakaoOAuthError("jwks");

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new KakaoOAuthError("jwks");
  }
  const parsed = jwksSchema.safeParse(payload);
  if (!parsed.success) throw new KakaoOAuthError("jwks");
  return parsed.data;
}

export async function verifyKakaoIdToken(params: {
  config: KakaoOAuthConfig;
  idToken: string;
  nonce: string;
  nowSeconds?: number;
}): Promise<void> {
  const parts = params.idToken.split(".");
  if (parts.length !== 3) throw new KakaoOAuthError("token");

  const header = jwtHeaderSchema.safeParse(decodeJsonPart(parts[0]));
  const claims = jwtClaimsSchema.safeParse(decodeJsonPart(parts[1]));
  if (!header.success || !claims.success) throw new KakaoOAuthError("token");

  const now = params.nowSeconds ?? Math.floor(Date.now() / 1_000);
  const isIssuedInFuture = claims.data.iat > now + CLOCK_SKEW_SECONDS;
  if (
    claims.data.exp < now - CLOCK_SKEW_SECONDS ||
    isIssuedInFuture ||
    claims.data.nonce !== params.nonce ||
    claims.data.aud !== params.config.restKey
  ) {
    throw new KakaoOAuthError("token");
  }

  let jwks = await getKakaoJwks("cached");
  let jwk = jwks.keys.find((candidate) => candidate.kid === header.data.kid);
  if (!jwk) {
    // 카카오가 서명 키를 회전하면 1시간 캐시가 낡았을 수 있다. kid가 없을 때만 즉시 한 번 갱신한다.
    jwks = await getKakaoJwks("fresh");
    jwk = jwks.keys.find((candidate) => candidate.kid === header.data.kid);
  }
  if (!jwk) throw new KakaoOAuthError("jwks");

  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const verified = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!verified) throw new KakaoOAuthError("token");
  } catch (error) {
    if (error instanceof KakaoOAuthError) throw error;
    throw new KakaoOAuthError("token");
  }
}
