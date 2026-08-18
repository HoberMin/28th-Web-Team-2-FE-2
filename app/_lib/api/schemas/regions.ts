// 법정동 검색·조회
//
// ⚠️ 함정 둘 (`backend-api-reference` §2):
//  1. `/regions/search`만 `{code, message, data}` envelope를 쓴다. 다른 엔드포인트는 안 쓴다.
//  2. `regionId`가 여기서는 string("0111010100"), `/regions/nearby`에서는 int64로 갈린다.
//     숫자로 다루면 앞자리 0이 사라지므로 **프론트는 string으로 통일**한다.

import { z } from "zod";

/** 앞자리 0이 있는 코드값이라 항상 문자열로 다룬다. 숫자로 와도 문자열로 바꾼다. */
const regionIdSchema = z.union([z.string(), z.number()]).transform((value) => String(value));

export const regionSchema = z.object({
  regionId: regionIdSchema,
  regionName: z.string(),
});
export type Region = z.infer<typeof regionSchema>;

/** `/regions/search` 전용 envelope — 이 엔드포인트에만 있다. */
export const regionSearchEnvelopeSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  data: z.object({ searchResults: z.array(regionSchema) }),
});

/** `/regions/nearby`는 최상위 배열을 그대로 준다. */
export const nearbyRegionsSchema = z.array(regionSchema);
