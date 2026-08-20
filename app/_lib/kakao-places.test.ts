import { afterEach, describe, expect, it, vi } from "vitest";
import { KakaoPlacesError, searchNearbyStorePlaces } from "./kakao-places";

const GONGDEOK_CENTER = { lat: 37.549119, lng: 126.957786 };

describe("searchNearbyStorePlaces", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("카카오 키가 없을 때 가짜 가게를 반환하지 않는다", async () => {
    vi.stubEnv("KAKAO_REST_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchNearbyStorePlaces(GONGDEOK_CENTER)).rejects.toBeInstanceOf(
      KakaoPlacesError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("정상적인 빈 검색 결과는 빈 목록으로 반환한다", async () => {
    vi.stubEnv("KAKAO_REST_KEY", "rest-key");
    const fetchMock = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ documents: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchNearbyStorePlaces(GONGDEOK_CENTER)).resolves.toEqual([]);
  });

  it("카카오 로컬 서비스 403을 가짜 가게로 숨기지 않는다", async () => {
    vi.stubEnv("KAKAO_REST_KEY", "rest-key");
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 403 }))));

    await expect(searchNearbyStorePlaces(GONGDEOK_CENTER)).rejects.toMatchObject({
      name: "KakaoPlacesError",
      status: 403,
    });
  });
});
