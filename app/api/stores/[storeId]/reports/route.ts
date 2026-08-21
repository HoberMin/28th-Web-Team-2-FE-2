// 가게 제보 BFF — 지도 시트(F03-2)의 "최근 제보"(최대 2개)가 부른다. 가게 상세 페이지의
// "저렴해요"·"비싸요" 전체 목록은 RSC라 `server/stores-fallback.ts`를 직접 호출한다.
export const dynamic = "force-dynamic";

import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getStoreReportsWithTemporaryFallback } from "@/app/_lib/api/server/stores-fallback";
import { privateJson, storesApiErrorResponse } from "@/app/api/stores/_api-error";

interface RouteContext {
  params: Promise<{ storeId: string }>;
}

const DEFAULT_SIZE = 2;
const MAX_SIZE = 20;

export async function GET(request: Request, { params }: RouteContext): Promise<Response> {
  const { storeId: rawStoreId } = await params;
  const storeId = Number(rawStoreId);
  if (!Number.isSafeInteger(storeId) || storeId <= 0) {
    return privateJson({ message: "가게 id가 올바르지 않아요." }, 400);
  }

  const { searchParams } = new URL(request.url);
  const sizeParam = Number(searchParams.get("size"));
  const size =
    Number.isInteger(sizeParam) && sizeParam > 0 ? Math.min(sizeParam, MAX_SIZE) : DEFAULT_SIZE;

  const token = await getAccessToken();

  try {
    const result = await getStoreReportsWithTemporaryFallback({
      storeId,
      filter: "ALL",
      page: 0,
      size,
      token,
    });
    const { reports } = result;
    return privateJson({
      ...reports,
      isTemporary: result.isTemporary,
      reports: reports.reports.slice(0, size),
    });
  } catch (error) {
    return storesApiErrorResponse(error, "최근 제보를 불러오지 못했어요.");
  }
}
