import "server-only";

import { ApiError } from "../error";
import { isKamisFailure, kamisDailyPriceSchema, type KamisDailyPriceItem } from "../schemas/kamis";
import { springFetch } from "../spring";
import { CACHE_TAGS } from "../tags";

export interface KamisDailyPriceParams {
  /** 가격 구분: 01 소매 / 02 도매. 기본 02. */
  productClsCode?: "01" | "02";
  /** 부류 코드: 100~600. 기본 100. */
  itemCategoryCode?: string;
  /** 지역 코드 4자리. */
  countryCode?: string;
  /** 조회 날짜 (YYYY-MM-DD). */
  regDay?: string;
  /** kg 환산 여부. */
  convertKgYn?: "Y" | "N";
}

/**
 * KAMIS 일별 부류별 가격.
 *
 * ⚠️ **200이어도 실패일 수 있다.** KAMIS가 본문에 errorCode를 실어 보내는 걸
 * Spring이 그대로 넘겨준다. status만 보고 성공 처리하면 빈 배열이 화면에 그대로 나간다.
 */
export async function getKamisDailyPrices(
  params: KamisDailyPriceParams = {},
): Promise<KamisDailyPriceItem[]> {
  const response = await springFetch({
    path: "/api/kamis/daily-prices",
    query: { ...params },
    schema: kamisDailyPriceSchema,
    // 일별 데이터라 하루 안에서는 거의 안 바뀐다. 사용자와 무관한 공개 데이터.
    cache: { revalidate: 3_600, tags: [CACHE_TAGS.kamisDailyPrices] },
  });

  if (isKamisFailure(response)) {
    throw new ApiError({
      kind: "upstream",
      status: 200,
      endpoint: "GET /api/kamis/daily-prices",
      message: `KAMIS 오류(${response.errorCode}): ${response.errorMessage ?? "사유 미상"}`,
    });
  }

  return response.items ?? [];
}
