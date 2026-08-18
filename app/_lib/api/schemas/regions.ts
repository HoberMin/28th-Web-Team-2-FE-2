// 법정동 검색·조회
//
// ⚠️ 함정 둘 (`backend-api-reference` §2):
//  1. `/regions/search`만 `{code, message, data}` envelope를 쓴다. 다른 엔드포인트는 안 쓴다.
//  2. `regionId`가 여기서는 string("0111010100"), `/regions/nearby`에서는 int64로 갈린다.
//     숫자로 다루면 앞자리 0이 사라지므로 **프론트는 string으로 통일**한다.

import { z } from "zod";

/** 법정동 코드 자릿수. 스펙 예시가 양쪽 다 10자리다(`"0111010100"` / `4413310500`). */
const REGION_ID_LENGTH = 10;

/**
 * 앞자리 0이 있는 코드값이라 항상 문자열로 다룬다.
 *
 * `/regions/nearby`는 이 값을 int64로 주는데, 서울(`0`으로 시작) 코드는 그 시점에 이미
 * 앞자리 0이 잘려 9자리로 온다. 자릿수가 10으로 고정이라 `padStart`로 복원한다 —
 * 안 하면 `/items?regionId=`에 9자리를 넘겨 **조용히 빈 목록**이 된다.
 *
 * TODO(✍️): 10자리 고정이 맞는지 BE 확인 대기(`농산물-문서/be-요청사항.md` C표).
 * 서버가 문자열로 통일해주면 이 복원 자체가 필요 없어진다.
 */
const regionIdSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).padStart(REGION_ID_LENGTH, "0"));

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
