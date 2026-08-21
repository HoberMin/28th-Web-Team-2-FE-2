import { describe, expect, it } from "vitest";
import { isPointInsideMap, type MapScreenPoint } from "./_cluster";

describe("map screen point visibility", () => {
  const size = { width: 390, height: 721 };

  it("지도 컨테이너 안의 좌표만 표시 대상으로 판정한다", () => {
    expect(isPointInsideMap({ x: 0, y: 0 }, size)).toBe(true);
    expect(isPointInsideMap({ x: 389, y: 720 }, size)).toBe(true);
    expect(isPointInsideMap({ x: -1, y: 100 }, size)).toBe(false);
    expect(isPointInsideMap({ x: 390, y: 100 }, size)).toBe(false);
    expect(isPointInsideMap({ x: 100, y: -1 }, size)).toBe(false);
    expect(isPointInsideMap({ x: 100, y: 721 }, size)).toBe(false);
  });

  it("유한하지 않은 좌표는 표시하지 않는다", () => {
    expect(
      isPointInsideMap({ x: Number.NaN, y: 100 } satisfies MapScreenPoint, size),
    ).toBe(false);
  });
});
