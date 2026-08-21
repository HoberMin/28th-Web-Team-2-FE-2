import "server-only";

import { FIXED_REGION_ID } from "../fixed-region";

import { revalidateTag } from "next/cache";
import {
  createReportEnvelopeSchema,
  regionLowestPricesEnvelopeSchema,
  type CreateReportRequest,
  type CreateReportResponse,
  type RegionLowestPrices,
} from "../schemas/reports";
import {
  regionItemReportPageEnvelopeSchema,
  type RegionItemReportPage,
  type RegionItemReportSort,
} from "../schemas/region-item-reports";
import { springFetch } from "../spring";
import { CACHE_TAGS, REVALIDATE_IMMEDIATELY } from "../tags";

/**
 * 우리 동네 가격 제보. 로그인이 필요하다(401).
 *
 * **Server Action이나 Route Handler에서만 호출한다** — `revalidateTag`가 들어 있다.
 */
export async function createReport(params: {
  itemId: number;
  body: CreateReportRequest;
  token: string;
}): Promise<CreateReportResponse> {
  const envelope = await springFetch({
    path: `/api/v1/items/${params.itemId}/reports`,
    method: "POST",
    body: params.body,
    token: params.token,
    schema: createReportEnvelopeSchema,
    cache: "no-store",
  });

  // 제보가 반영되면 품목의 latestLocalReportPrice(최근 동네 제보가)와 가게 정보가 같이 바뀐다.
  revalidateTag(CACHE_TAGS.items, REVALIDATE_IMMEDIATELY);
  revalidateTag(CACHE_TAGS.stores, REVALIDATE_IMMEDIATELY);

  return envelope.data;
}

/**
 * 동네 최근 7일 최저가 품목 (F01 홈 「우리 동네 최저가」).
 *
 * 동네 단위 집계라 개인화 필드가 없다 — 로그인 여부와 무관하게 같은 값이고 공유 캐시를 쓴다.
 * 제보가 들어오면 `createReport`가 `stores` 태그를 즉시 무효화해 목록이 갱신된다.
 *
 * `regionId`는 법정동 코드다 — 앞자리 0이 유실되지 않도록 문자열로 받는다.
 */
export async function getRegionLowestPrices(params: {
  regionId: string;
  limit?: number;
}): Promise<RegionLowestPrices> {
  const envelope = await springFetch({
    path: `/api/v1/regions/${encodeURIComponent(FIXED_REGION_ID)}/reports/lowest-prices`,
    query: { limit: params.limit },
    schema: regionLowestPricesEnvelopeSchema,
    cache: { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}

export interface GetRegionItemReportsParams {
  /** 법정동 코드 — 앞자리 0 유실 방지를 위해 문자열이다. */
  regionId: string;
  itemId: number;
  sort?: RegionItemReportSort;
  page?: number;
  size?: number;
}

/**
 * 동네 품목 제보 목록 (F03-1 「동네 제보가」 + 더보기 시트).
 *
 * 동네·품목 단위 집계라 개인화 필드가 없어 공유 캐시를 쓴다. 제보 생성이 `stores` 태그를
 * 무효화하므로 새 제보가 바로 반영된다. 제보가 없으면 `reports: []`로 정상 200이 온다.
 */
export async function getRegionItemReports(
  params: GetRegionItemReportsParams,
): Promise<RegionItemReportPage> {
  const { itemId, ...query } = params;
  const envelope = await springFetch({
    path: `/api/v1/regions/${encodeURIComponent(FIXED_REGION_ID)}/items/${itemId}/reports`,
    query: { ...query },
    schema: regionItemReportPageEnvelopeSchema,
    cache: { revalidate: 300, tags: [CACHE_TAGS.stores] },
  });
  return envelope.data;
}
