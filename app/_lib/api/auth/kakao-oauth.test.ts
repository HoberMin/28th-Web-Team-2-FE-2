import { afterEach, describe, expect, it, vi } from "vitest";
import type { KakaoOAuthConfig } from "./kakao-oauth-config";
import {
  createKakaoAuthorizationUrl,
  exchangeKakaoCode,
  KakaoOAuthError,
  verifyKakaoIdToken,
} from "./kakao-oauth";

const config: KakaoOAuthConfig = {
  clientSecret: "client-secret",
  redirectUri: new URL("http://localhost:3000/api/auth/kakao/callback"),
  restKey: "rest-key",
};

function base64Url(value: string | ArrayBuffer): string {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signedToken(params: {
  audience?: string | string[];
  expiresAt: number;
  includeIssuedAt?: boolean;
  kid?: string;
  nonce: string;
}) {
  const keyPair = (await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const kid = params.kid ?? "test-key";
  const header = base64Url(JSON.stringify({ alg: "RS256", kid, typ: "JWT" }));
  const claims: Record<string, unknown> = {
      aud: params.audience ?? config.restKey,
      exp: params.expiresAt,
      iss: "https://kauth.kakao.com",
      nonce: params.nonce,
      sub: "kakao-user-id",
  };
  if (params.includeIssuedAt !== false) claims.iat = params.expiresAt - 300;
  const payload = base64Url(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    keyPair.privateKey,
    new TextEncoder().encode(signingInput),
  );
  const exported = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const jwk = { ...exported, alg: "RS256", kid, use: "sig" };
  return { jwk, token: `${signingInput}.${base64Url(signature)}` };
}

describe("Kakao OAuth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("authorization URL에는 공개 REST 키와 state·nonce만 포함하고 시크릿은 넣지 않는다", () => {
    const url = createKakaoAuthorizationUrl({ config, state: "state", nonce: "nonce" });

    expect(url.origin + url.pathname).toBe("https://kauth.kakao.com/oauth/authorize");
    expect(url.searchParams.get("client_id")).toBe(config.restKey);
    expect(url.searchParams.get("redirect_uri")).toBe(config.redirectUri.toString());
    expect(url.searchParams.get("scope")).toBe("openid");
    expect(url.searchParams.get("state")).toBe("state");
    expect(url.searchParams.get("nonce")).toBe("nonce");
    expect(url.toString()).not.toContain(config.clientSecret);
  });

  it("code를 서버에서 no-store로 교환하고 ID token만 반환한다", async () => {
    const fetchMock = vi.fn<(input: string | URL, init?: RequestInit) => Promise<Response>>(
      async () =>
        Response.json({ access_token: "kakao-access", id_token: "header.payload.signature" }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(exchangeKakaoCode({ code: "authorization-code", config })).resolves.toBe(
      "header.payload.signature",
    );
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://kauth.kakao.com/oauth/token");
    expect(init?.cache).toBe("no-store");
    expect(String(init?.body)).toContain("client_secret=client-secret");
    expect(String(init?.body)).toContain("code=authorization-code");
  });

  it("서명·issuer·audience·nonce·만료를 모두 통과한 ID token만 허용한다", async () => {
    const now = 2_000_000_000;
    const { jwk, token } = await signedToken({ expiresAt: now + 300, nonce: "expected-nonce" });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ keys: [jwk] })));

    await expect(
      verifyKakaoIdToken({ config, idToken: token, nonce: "expected-nonce", nowSeconds: now }),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["nonce 불일치", { nonce: "other", audience: config.restKey, expiresAt: 2_000_000_300 }],
    ["audience 불일치", { nonce: "expected", audience: "other-app", expiresAt: 2_000_000_300 }],
    ["만료", { nonce: "expected", audience: config.restKey, expiresAt: 1_999_999_000 }],
  ])("%s ID token은 JWKS 요청 전에 거부한다", async (_case, tokenParams) => {
    const { token } = await signedToken(tokenParams);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifyKakaoIdToken({ config, idToken: token, nonce: "expected", nowSeconds: 2_000_000_000 }),
    ).rejects.toMatchObject({ kind: "token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["aud 배열", { audience: [config.restKey], includeIssuedAt: true }],
    ["iat 누락", { audience: config.restKey, includeIssuedAt: false }],
  ])("Kakao 계약과 다른 %s claims를 JWKS 요청 전에 거부한다", async (_case, overrides) => {
    const { token } = await signedToken({
      audience: overrides.audience,
      expiresAt: 2_000_000_300,
      includeIssuedAt: overrides.includeIssuedAt,
      nonce: "expected",
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifyKakaoIdToken({ config, idToken: token, nonce: "expected", nowSeconds: 2_000_000_000 }),
    ).rejects.toMatchObject({ kind: "token" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Kakao token endpoint 오류 본문을 노출하지 않고 표준 오류로 바꾼다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "secret-detail" }, { status: 401 })));

    await expect(exchangeKakaoCode({ code: "bad-code", config })).rejects.toMatchObject({
      kind: "exchange",
    } satisfies Partial<KakaoOAuthError>);
  });

  it("캐시된 JWKS에 새 kid가 없으면 fresh JWKS를 한 번 조회해 키 회전을 복구한다", async () => {
    const now = 2_000_000_000;
    const stale = await signedToken({ expiresAt: now + 300, kid: "old-key", nonce: "nonce" });
    const current = await signedToken({ expiresAt: now + 300, kid: "new-key", nonce: "nonce" });
    const fetchMock = vi
      .fn<(input: string | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(Response.json({ keys: [stale.jwk] }))
      .mockResolvedValueOnce(Response.json({ keys: [current.jwk] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      verifyKakaoIdToken({ config, idToken: current.token, nonce: "nonce", nowSeconds: now }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]?.[1]?.cache).toBe("no-store");
  });

  it("claims가 맞아도 서명이 변조된 ID token은 거부한다", async () => {
    const now = 2_000_000_000;
    const { jwk, token } = await signedToken({ expiresAt: now + 300, nonce: "nonce" });
    const parts = token.split(".");
    const signature = parts[2] ?? "";
    const tampered = `${parts[0]}.${parts[1]}.${signature.startsWith("A") ? "B" : "A"}${signature.slice(1)}`;
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ keys: [jwk] })));

    await expect(
      verifyKakaoIdToken({ config, idToken: tampered, nonce: "nonce", nowSeconds: now }),
    ).rejects.toMatchObject({ kind: "token" });
  });
});
