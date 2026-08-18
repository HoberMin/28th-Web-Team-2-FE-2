import { describe, expect, it } from "vitest";
import {
  mapCategoryCounts,
  mapGroupToApi,
  mapSortToApi,
  normalizeGroup,
  normalizeSort,
} from "./_query";

describe("시세 URL 쿼리 API 매핑", () => {
  it.each([
    ["name", "NAME_ASC"],
    ["price-asc", "PRICE_ASC"],
    ["price-desc", "PRICE_DESC"],
  ] as const)("sort=%s를 Swagger 정렬값 %s로 보낸다", (query, expected) => {
    expect(mapSortToApi(normalizeSort(query))).toBe(expected);
  });

  it.each(["recent", "cheap", "unknown"])("지원하지 않는 sort=%s를 임의 변환하지 않는다", (query) => {
    expect(normalizeSort(query)).toBe("name");
    expect(mapSortToApi(normalizeSort(query))).toBe("NAME_ASC");
  });

  it("한글 그룹을 Swagger 카테고리 enum으로 명시적으로 바꾼다", () => {
    expect(mapGroupToApi(normalizeGroup("감자·뿌리"))).toBe("ROOT_VEGETABLES");
    expect(mapGroupToApi(normalizeGroup("과채"))).toBe("FRUITS");
    expect(mapGroupToApi(normalizeGroup("없는 그룹"))).toBeUndefined();
  });

  it("API 카테고리별 개수를 UI 그룹 순서로 옮긴다", () => {
    expect(
      mapCategoryCounts({
        ROOT_VEGETABLES: 5,
        LEAFY_GREENS: 12,
        FRUITS: 4,
      }),
    ).toMatchObject({
      "감자·뿌리": 5,
      잎채소: 12,
      과채: 4,
      버섯: 0,
    });
  });
});
