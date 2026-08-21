import { getAccessToken } from "@/app/_lib/api/auth/session";
import { nearbyStoresRequestSchema } from "@/app/_lib/api/schemas/stores";
import { getNearbyStores } from "@/app/_lib/api/server/stores";
import { privateJson, storesApiErrorResponse } from "../_api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = nearbyStoresRequestSchema.safeParse({
    latitude: searchParams.get("latitude") ?? undefined,
    longitude: searchParams.get("longitude") ?? undefined,
    radius: searchParams.get("radius") ?? undefined,
    onlyLiked: searchParams.get("onlyLiked") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  });

  if (!parsed.success) {
    return privateJson({ message: "가게 조회 조건을 확인해 주세요." }, 400);
  }

  const token = await getAccessToken();

  // ⚠️ `getNearbyStoresWithTemporaryFallback`을 쓰지 않는다 — 그 폴백은 반경 안에 실데이터가
  // 0건이면 고정 더미 가게로 채우는데, 더미의 storeId(`storeIdForIndex` = 1,2,3…)가 라이브
  // Spring의 실제 storeId와 우연히 겹친다. 목록엔 더미 이름이 보이지만 마커를 눌러
  // `/stores/{storeId}`로 들어가면 그 id의 **진짜 다른 가게**가 뜬다 — "누르면 다른 가게가
  // 나온다"는 사용자 리포트(2026-08-21)의 원인이었다. 지금은 라이브 DB에 가게가 충분히
  // 있어 이 폴백이 필요했던 "DB가 텅 비어 있던" 시절의 전제 자체가 낡았다. 진짜 빈 결과는
  // `_map-view.tsx`의 "검색 결과가 없어요" 빈 상태가 이미 처리한다.
  try {
    const stores = await getNearbyStores({ ...parsed.data, token });
    return privateJson(stores);
  } catch (error) {
    return storesApiErrorResponse(error, "주변 가게를 불러오지 못했어요.");
  }
}
