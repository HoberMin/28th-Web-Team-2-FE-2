import { describe, expect, it } from "vitest";
import { crossOriginResponse, isSameOriginRequest } from "./request-origin";

describe("auth request origin", () => {
  it("Origin과 요청 URL의 origin이 같으면 허용한다", () => {
    const request = new Request("https://app.example.com/api/auth/logout", {
      method: "POST",
      headers: { Origin: "https://app.example.com" },
    });

    expect(isSameOriginRequest(request)).toBe(true);
    expect(crossOriginResponse(request)).toBeNull();
  });

  it("Vercel forwarded host와 proto로 외부 origin을 복원한다", () => {
    const request = new Request("http://internal:3000/api/auth/reissue", {
      method: "POST",
      headers: {
        Origin: "https://preview.example.com",
        "X-Forwarded-Host": "preview.example.com",
        "X-Forwarded-Proto": "https",
      },
    });

    expect(isSameOriginRequest(request)).toBe(true);
  });

  it.each([
    ["Origin 없음", {}],
    ["null Origin", { Origin: "null" }],
    ["다른 origin", { Origin: "https://attacker.example" }],
    ["path가 포함된 Origin", { Origin: "https://app.example.com/path" }],
  ])("%s 요청을 거부한다", (_case, headers) => {
    const request = new Request("https://app.example.com/api/auth/logout", {
      method: "POST",
      headers,
    });

    expect(isSameOriginRequest(request)).toBe(false);
  });

  it("검증 실패를 토큰 없는 403 응답으로 변환한다", async () => {
    const request = new Request("https://app.example.com/api/auth/logout", { method: "POST" });

    const response = crossOriginResponse(request);

    expect(response).not.toBeNull();
    if (!response) throw new Error("교차 출처 요청은 응답으로 거부되어야 합니다.");
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "요청 출처를 확인할 수 없어요." });
  });
});
