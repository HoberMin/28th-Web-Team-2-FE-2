import { describe, expect, it } from "vitest";
import { parseCarriedStore } from "./carried-store";

describe("제보 장소 URL 복원", () => {
  it("가게 상세에서 넘어온 기존 매장을 복원한다", () => {
    expect(
      parseCarriedStore(
        JSON.stringify({
          kind: "existing",
          storeId: 7,
          placeName: "농협하나로마트",
          addressName: "서울특별시 광진구",
        }),
      ),
    ).toEqual({
      source: "existing",
      storeId: 7,
      placeName: "농협하나로마트",
      addressName: "서울특별시 광진구",
    });
  });

  it("장소 검색에서 넘어온 새 매장 정보를 복원한다", () => {
    expect(
      parseCarriedStore(
        JSON.stringify({
          id: "kakao-123",
          placeName: "시장 채소가게",
          addressName: "서울특별시 마포구",
        }),
      ),
    ).toEqual({
      source: "search",
      placeName: "시장 채소가게",
      store: {
        id: "kakao-123",
        placeName: "시장 채소가게",
        addressName: "서울특별시 마포구",
      },
    });
  });

  it("숫자 하나만 전달된 이전의 잘못된 값은 거부한다", () => {
    expect(parseCarriedStore("7")).toBeUndefined();
  });
});
