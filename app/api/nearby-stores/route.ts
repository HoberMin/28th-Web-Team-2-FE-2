// 근처 가게 BFF — 클라 인터랙션이 부르는 얇은 HTTP 표면. 실제 검색·매핑은
// `app/_lib/kakao-places.ts`(server-only)에 있다 — F04-3 장소 선택 Server Component도
// 같은 함수를 직접 호출해서 재사용한다(`api-patterns` 3층 규칙).
//
// 위치 기반 개인화 조회라 항상 최신 좌표로 조회한다 — 라우트 전체를 동적으로 선언(no-store).
export const dynamic = "force-dynamic";

import { KakaoPlacesError, searchNearbyStorePlaces } from "@/app/_lib/kakao-places";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat = latParam === null ? Number.NaN : Number(latParam);
  const lng = lngParam === null ? Number.NaN : Number(lngParam);
  try {
    const stores = await searchNearbyStorePlaces({ lat, lng });
    return Response.json(stores);
  } catch (error) {
    if (!(error instanceof KakaoPlacesError)) throw error;
    const status = Number.isFinite(lat) && Number.isFinite(lng) ? 502 : 400;
    return Response.json({ message: "가게 검색을 불러오지 못했어요." }, { status });
  }
}
