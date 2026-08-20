import { describe, expect, it } from "vitest";
import { getExactReportUnit } from "./report-unit";

describe("getExactReportUnit", () => {
  it.each(["1kg", "100g", "1개", "1포기"])(
    "백엔드 defaultUnit %s의 수량 접두사를 제거하지 않는다",
    (defaultUnit) => {
      expect(getExactReportUnit(defaultUnit)).toBe(defaultUnit);
    },
  );

  it.each([undefined, null, "", "   "])("단위가 없으면 제출값을 만들지 않는다", (defaultUnit) => {
    expect(getExactReportUnit(defaultUnit)).toBeUndefined();
  });
});
