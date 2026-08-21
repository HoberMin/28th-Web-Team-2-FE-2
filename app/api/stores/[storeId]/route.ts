// 가게 상세 BFF — 지도 시트(F03-2)가 마커를 누른 시점에 클라이언트에서 부른다.
// RSC인 가게 상세 페이지는 `server/stores.ts#getStoreDetail`을 직접 호출하므로 이 라우트를
// 거치지 않는다 — 여기는 "use client" 트리(`_store-sheet.tsx`)를 위한 얇은 HTTP 표면이다.
export const dynamic = "force-dynamic";

import { getAccessToken } from "@/app/_lib/api/auth/session";
import { storeDetailRequestSchema } from "@/app/_lib/api/schemas/stores";
import { getStoreDetail } from "@/app/_lib/api/server/stores";
import { privateJson, storesApiErrorResponse } from "@/app/api/stores/_api-error";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

export async function GET(request: Request, { params }: RouteContext): Promise<Response> {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);
  if (!Number.isSafeInteger(storeId) || storeId <= 0) {
    return privateJson({ message: "가게 id가 올바르지 않아요." }, 400);
  }

  const { searchParams } = new URL(request.url);
  const parsed = storeDetailRequestSchema.safeParse({
    latitude: searchParams.get("latitude") ?? undefined,
    longitude: searchParams.get("longitude") ?? undefined,
  });
  if (!parsed.success) {
    return privateJson({ message: "가게 조회 조건을 확인해 주세요." }, 400);
  }

  const token = await getAccessToken();

  try {
    const detail = await getStoreDetail({ storeId, ...parsed.data, token });
    return privateJson(detail);
  } catch (error) {
    return storesApiErrorResponse(error, "가게 정보를 불러오지 못했어요.");
  }
}
