import { describe, expect, it } from "vitest";
import { getSpringBaseUrl, SPRING_REQUEST_TIMEOUT_MS } from "./spring-config";

describe("Spring API config", () => {
  it("HTTPS root origin을 upstream base URL로 허용한다", () => {
    expect(getSpringBaseUrl("https://api.example.com").href).toBe("https://api.example.com/");
    expect(getSpringBaseUrl("https://api.example.com:8443/").href).toBe(
      "https://api.example.com:8443/",
    );
  });

  it.each([
    ["HTTP", "http://api.example.com"],
    ["username", "https://user@api.example.com"],
    ["password", "https://user:password@api.example.com"],
    ["path", "https://api.example.com/v1"],
    ["query", "https://api.example.com/?env=test"],
    ["hash", "https://api.example.com/#test"],
    ["invalid URL", "not-a-url"],
  ])("%s가 포함된 base URL을 거부한다", (_case, value) => {
    expect(() => getSpringBaseUrl(value)).toThrow("SPRING_API_BASE_URL");
  });

  it("인증 upstream timeout을 10초로 고정한다", () => {
    expect(SPRING_REQUEST_TIMEOUT_MS).toBe(10_000);
  });
});
