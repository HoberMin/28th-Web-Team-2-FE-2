import { describe, expect, it } from "vitest";
import { mapFavoriteStoreToView } from "./_saved-store-view";

describe("mapFavoriteStoreToView", () => {
  it("찜 가게의 영업정보는 고정 표시한다", () => {
    const view = mapFavoriteStoreToView({
      storeId: 85,
      storeName: "테스트 마트",
      storeImageUrl: null,
      distanceMeters: null,
      openStatus: "UNKNOWN",
      todayBusinessHours: null,
      isLiked: true,
    });

    expect(view).toMatchObject({
      openState: "open",
      openLabel: "영업시간",
      hours: "월~토 09:00~18:00 · 일요일 휴무",
    });
  });
});
