import { afterEach, describe, expect, it, vi } from "vitest";
import { getNearbyStoresAPI, StoresClientError } from "./stores";

const successBody = {
  totalCount: 1,
  stores: [
    {
      storeId: 123,
      storeName: "장보고 마트",
      latitude: 37.5088,
      longitude: 127.0632,
      isLiked: true,
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getNearbyStoresAPI", () => {
  it("검증된 조건으로 same-origin BFF를 no-store 조회한다", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(successBody), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    await expect(
      getNearbyStoresAPI(
        {
          latitude: 37.5088,
          longitude: 127.0632,
          radius: 2000,
          keyword: "  장보고 마트  ",
          onlyLiked: true,
        },
        controller.signal,
      ),
    ).resolves.toEqual(successBody);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/stores/nearby?latitude=37.5088&longitude=127.0632&radius=2000&onlyLiked=true&keyword=%EC%9E%A5%EB%B3%B4%EA%B3%A0+%EB%A7%88%ED%8A%B8",
      { cache: "no-store", signal: controller.signal },
    );
  });

  it("유효하지 않은 좌표는 BFF를 호출하기 전에 거부한다", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getNearbyStoresAPI({
        latitude: 91,
        longitude: 127.0632,
        radius: 2000,
        onlyLiked: false,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("BFF 오류 status와 안전한 메시지를 화면 경계로 전달한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ message: "로그인이 필요해요." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const request = getNearbyStoresAPI({
      latitude: 37.5088,
      longitude: 127.0632,
      radius: 2000,
      onlyLiked: true,
    });

    await expect(request).rejects.toBeInstanceOf(StoresClientError);
    await expect(request).rejects.toMatchObject({ status: 401, message: "로그인이 필요해요." });
  });

  it("계약과 다른 성공 응답을 가게 목록으로 사용하지 않는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ stores: "invalid" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      getNearbyStoresAPI({
        latitude: 37.5088,
        longitude: 127.0632,
        radius: 2000,
        onlyLiked: false,
      }),
    ).rejects.toMatchObject({ status: 502 });
  });
});
