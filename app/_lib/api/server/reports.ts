import "server-only";

import { revalidateTag } from "next/cache";
import {
  createReportResponseSchema,
  type CreateReportRequest,
  type CreateReportResponse,
} from "../schemas/reports";
import { springFetch } from "../spring";
import { CACHE_TAGS, REVALIDATE_PROFILE } from "../tags";

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
  const created = await springFetch({
    path: `/api/v1/items/${params.itemId}/reports`,
    method: "POST",
    body: params.body,
    token: params.token,
    schema: createReportResponseSchema,
    cache: "no-store",
  });

  // 제보가 반영되면 품목 시세와 가게 정보가 같이 바뀐다.
  revalidateTag(CACHE_TAGS.items, REVALIDATE_PROFILE);
  revalidateTag(CACHE_TAGS.stores, REVALIDATE_PROFILE);

  return created;
}
