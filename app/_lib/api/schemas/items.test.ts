import { describe, expect, it } from "vitest";
import { itemPageEnvelopeSchema, itemPageSchema } from "./items";

describe("itemPageSchema", () => {
  it("기준일·가격·이미지가 없는 지역 응답을 거부하지 않는다", () => {
    const result = itemPageSchema.parse({
      baseDate: null,
      totalCount: 1,
      categoryCounts: { LEAFY_GREENS: 1 },
      items: [
        {
          itemId: 46,
          itemName: "갓",
          itemImageUrl: null,
          defaultUnit: "1kg",
          price: null,
          priceGap: null,
          priceDiffRate: null,
          isLiked: false,
        },
      ],
      page: 0,
      size: 10,
      hasNext: false,
    });

    expect(result.items[0]).toMatchObject({
      itemId: 46,
      itemName: "갓",
      price: null,
      priceGap: null,
      priceDiffRate: null,
    });
    expect(result.baseDate).toBeNull();
  });

  it("잘못된 기준일 형식은 API 경계에서 거부한다", () => {
    const result = itemPageSchema.safeParse({
      baseDate: "2026-8-16",
      totalCount: 0,
      categoryCounts: {},
      items: [],
      page: 0,
      size: 10,
      hasNext: false,
    });

    expect(result.success).toBe(false);
  });

  const item = {
    itemId: 46,
    itemName: "갓",
    itemImageUrl: null,
    defaultUnit: "1kg",
    price: null,
    priceGap: null,
    priceDiffRate: null,
    isLiked: false,
  };
  const page = {
    baseDate: "2026-08-16",
    totalCount: 1,
    categoryCounts: { LEAFY_GREENS: 1 },
    items: [item],
    page: 0,
    size: 10,
    hasNext: false,
  };

  it.each([
    ["정수가 아닌 품목 ID", { ...page, items: [{ ...item, itemId: 1.5 }] }],
    ["안전 범위를 벗어난 품목 ID", { ...page, items: [{ ...item, itemId: 2 ** 53 }] }],
    ["정수가 아닌 전체 개수", { ...page, totalCount: 1.5 }],
    ["안전 범위를 벗어난 전체 개수", { ...page, totalCount: 2 ** 53 }],
    ["음수 페이지", { ...page, page: -1 }],
    ["안전 범위를 벗어난 페이지", { ...page, page: 2 ** 53 }],
    ["0인 페이지 크기", { ...page, size: 0 }],
    ["안전 범위를 벗어난 페이지 크기", { ...page, size: 2 ** 53 }],
    [
      "안전 범위를 벗어난 카테고리 개수",
      { ...page, categoryCounts: { LEAFY_GREENS: 2 ** 53 } },
    ],
  ])("%s은 API 경계에서 거부한다", (_case, payload) => {
    expect(itemPageSchema.safeParse(payload).success).toBe(false);
  });
});

describe("itemPageEnvelopeSchema", () => {
  const data = {
    baseDate: "2026-08-16",
    totalCount: 0,
    categoryCounts: {},
    items: [],
    page: 0,
    size: 18,
    hasNext: false,
  };

  it("품목 응답의 endpoint 전용 envelope를 검증한다", () => {
    expect(
      itemPageEnvelopeSchema.parse({
        code: "SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data,
      }).data,
    ).toEqual(data);
  });

  it("스펙상 선택인 메타데이터가 없어도 data를 유지한다", () => {
    expect(itemPageEnvelopeSchema.parse({ data }).data).toEqual(data);
  });

  it("예전 raw DTO 형태는 API 경계에서 거부한다", () => {
    expect(itemPageEnvelopeSchema.safeParse(data).success).toBe(false);
  });
});
