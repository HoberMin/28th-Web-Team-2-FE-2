import { describe, expect, it } from "vitest";
import {
  itemDetailSchema,
  itemPageEnvelopeSchema,
  itemPageRequestSchema,
  itemPageSchema,
} from "./items";

describe("itemPageRequestSchema", () => {
  it("BFF 문자열 쿼리를 Spring 페이지 계약으로 바꾼다", () => {
    expect(
      itemPageRequestSchema.parse({
        page: "2",
        size: "18",
        sort: "PRICE_ASC",
        keyword: " 감자 ",
        category: "ROOT_VEGETABLES",
      }),
    ).toEqual({
      page: 2,
      size: 18,
      sort: "PRICE_ASC",
      keyword: "감자",
      category: "ROOT_VEGETABLES",
    });
  });

  it.each([
    ["빈 페이지", { page: "" }],
    ["음수 페이지", { page: "-1" }],
    ["0인 크기", { size: "0" }],
    ["상한을 넘는 크기", { size: "101" }],
    ["지원하지 않는 정렬", { sort: "RECENT" }],
    ["지원하지 않는 카테고리", { category: "GRAINS" }],
  ])("%s 쿼리를 거부한다", (_case, query) => {
    expect(itemPageRequestSchema.safeParse(query).success).toBe(false);
  });
});

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

describe("itemDetailSchema", () => {
  it("라이브 응답(flat, envelope 없음)을 그대로 파싱한다", () => {
    const payload = {
      itemId: 1,
      itemName: "감자",
      itemImageUrl: null,
      defaultUnit: "1kg",
      isLiked: false,
      latestLocalReportPrice: null,
      todayPublicPrice: 3500,
      onlineLowestPrice: null,
      baseDate: "2026-08-16",
      priceGap: null,
      priceDiffRate: null,
    };

    expect(itemDetailSchema.parse(payload)).toEqual(payload);
  });

  it("누락되거나 null인 찜 여부는 false로 취급한다", () => {
    expect(
      itemDetailSchema.parse({ itemId: 1, itemName: "감자", isLiked: null }).isLiked,
    ).toBe(false);
  });

  it("envelope로 감싸진 형태는 거부한다(이 엔드포인트는 flat이 계약이다)", () => {
    expect(
      itemDetailSchema.safeParse({
        code: "SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: { itemId: 1, itemName: "감자" },
      }).success,
    ).toBe(false);
  });
});
