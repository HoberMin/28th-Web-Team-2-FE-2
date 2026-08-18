// GET /api/kamis/daily-prices — KAMIS 일별 부류별 가격 (Spring이 KAMIS를 앞단에서 감싼다)
//
// ⚠️ 함정: 이 응답은 **200이어도 실패일 수 있다.** 본문에 errorCode/errorMessage가 실려 온다
// (`backend-api-reference` §2). status만 보고 성공 처리하면 빈 화면이 된다.

import { z } from "zod";

export const kamisDailyPriceItemSchema = z.object({
  itemName: z.string().optional(),
  itemCode: z.string().optional(),
  kindName: z.string().optional(),
  kindCode: z.string().optional(),
  rank: z.string().optional(),
  unit: z.string().optional(),
  // day1~7 / dpr1~7 — 날짜와 가격이 쌍으로 온다. 값은 전부 문자열이다(숫자 아님).
  day1: z.string().optional(),
  dpr1: z.string().optional(),
  day2: z.string().optional(),
  dpr2: z.string().optional(),
  day3: z.string().optional(),
  dpr3: z.string().optional(),
  day4: z.string().optional(),
  dpr4: z.string().optional(),
  day5: z.string().optional(),
  dpr5: z.string().optional(),
  day6: z.string().optional(),
  dpr6: z.string().optional(),
  day7: z.string().optional(),
  dpr7: z.string().optional(),
});
export type KamisDailyPriceItem = z.infer<typeof kamisDailyPriceItemSchema>;

export const kamisDailyPriceSchema = z.object({
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  items: z.array(kamisDailyPriceItemSchema).optional(),
});
export type KamisDailyPrice = z.infer<typeof kamisDailyPriceSchema>;

/**
 * KAMIS는 성공해도 errorCode를 실어 보낼 수 있다. `"000"`만 정상으로 본다.
 *
 * TODO(✍️): `"000"`은 KAMIS OpenAPI 관례이지 **Spring이 문서화한 계약이 아니다**
 * (스펙의 errorCode에 enum·example이 없다). Spring이 값을 `"SUCCESS"` 같은 걸로
 * 정규화하면 이 함수가 항상 true가 되어 모든 호출이 실패로 뒤집힌다.
 * 실호출 1회로 확정할 것 — `농산물-문서/be-요청사항.md` C표에 올려 뒀다.
 */
export function isKamisFailure(response: KamisDailyPrice): boolean {
  return Boolean(response.errorCode && response.errorCode !== "000");
}
