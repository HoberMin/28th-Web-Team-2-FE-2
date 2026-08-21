import { describe, expect, it } from "vitest";
import { ASSADA_MART_CENTER, ASSADA_MART_STORE } from "./assada-mart";

describe("아!싸다 마트 지도 앵커", () => {
  it("공덕동 242-90에 store id 999로 고정된다", () => {
    expect(ASSADA_MART_STORE).toMatchObject({
      id: "999",
      placeName: "아!싸다 마트",
      addressName: "서울 마포구 공덕동 242-90",
      x: ASSADA_MART_CENTER.lng,
      y: ASSADA_MART_CENTER.lat,
    });
  });
});
