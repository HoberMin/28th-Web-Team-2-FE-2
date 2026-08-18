// GET /api/v1/items — 품목 목록과 공공가격
//
// ⚠️ 응답을 envelope로 감싸지 않는다. 이 백엔드는 엔드포인트마다 형태가 달라
// 공통 unwrap 유틸을 두지 않는다 (`backend-api-reference` §2).

import { z } from "zod";

export const ITEM_SORTS = ["NAME_ASC", "PRICE_ASC", "PRICE_DESC"] as const;
export type ItemSort = (typeof ITEM_SORTS)[number];

export const ITEM_CATEGORIES = [
  "ROOT_VEGETABLES",
  "LEAFY_GREENS",
  "FRUITING_VEGETABLES",
  "PEPPERS",
  "SEASONINGS",
  "MUSHROOMS",
  "FRUITS",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const itemSchema = z.object({
  itemId: z.number(),
  itemName: z.string(),
  /** 라이브 응답은 이미지가 없을 때 `null`을 반환한다(Swagger의 string 선언과 불일치). */
  itemImageUrl: z.string().nullable().optional(),
  /** 스펙상 nullable — 단위가 정해지지 않은 품목이 있다. */
  defaultUnit: z.string().nullable().optional(),
  /** 기준일 가격이 없는 계절 품목은 라이브 응답에서 `null`이다. */
  price: z.number().nullable(),
  /** 직전 대비 가격 차이(원). */
  priceGap: z.number().nullable(),
  /** 직전 대비 변동률. */
  priceDiffRate: z.number().nullable(),
  /**
   * 로그인 사용자의 찜 여부 — **이 필드 때문에 응답을 공유 캐시에 넣으면 안 된다.**
   * 비회원 응답에도 이 필드가 오는지는 미확정이라(BE 요청 3번) 없거나 null이면 false로 본다.
   * 필수로 두면 게스트의 시세 화면 전체가 파싱 에러로 사라진다.
   * `.default()`가 아니라 `.nullish()`인 이유: `.default()`는 **필드 누락만** 흡수하고
   * `null`은 그대로 실패시킨다. Jackson이 미설정 boolean을 null로 직렬화하는 일이 흔하다.
   */
  isLiked: z.boolean().nullish().transform((value) => value ?? false),
});
export type Item = z.infer<typeof itemSchema>;

export const itemPageSchema = z.object({
  /** 지역에 표시할 공공가격이 하나도 없으면 라이브 응답은 `null`이다. */
  baseDate: z.iso.date().nullable(),
  totalCount: z.number(),
  /** 카테고리별 개수 — 키가 고정이 아니라 record로 받는다. */
  categoryCounts: z.record(z.string(), z.number()).optional(),
  items: z.array(itemSchema),
  page: z.number(),
  size: z.number(),
  hasNext: z.boolean(),
});
export type ItemPage = z.infer<typeof itemPageSchema>;
