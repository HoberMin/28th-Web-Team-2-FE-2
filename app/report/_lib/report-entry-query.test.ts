import { describe, expect, it } from "vitest";
import {
  buildExistingStoreReportHref,
  buildItemReportHref,
} from "./report-entry-query";

describe("제보 진입 URL", () => {
  it("시세 상세의 숫자 품목 ID를 전달한다", () => {
    expect(buildItemReportHref(37)).toBe("/report?item=37");
  });

  it("가게 상세의 기존 매장 ID와 표시 정보를 전달한다", () => {
    const href = buildExistingStoreReportHref({
      storeId: 7,
      placeName: "농협하나로마트",
      addressName: "서울특별시 광진구",
    });
    const url = new URL(href, "https://marketgo.test");

    expect(JSON.parse(url.searchParams.get("store") ?? "null")).toEqual({
      kind: "existing",
      storeId: 7,
      placeName: "농협하나로마트",
      addressName: "서울특별시 광진구",
    });
  });
});
