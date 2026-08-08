// 근처 가게 BFF — Kakao 로컬 키워드 검색(청과·채소·과일·마트)을 반경 순으로 호출.
// KAKAO_REST_KEY는 여기(서버)까지만 — 클라이언트 번들에 절대 노출하지 않는다.
// 키 미설정·업스트림 실패·응답 파싱 실패는 전부 더미로 폴백(_lib/nearby-stores.ts와 형태 동일).
//
// 위치 기반 개인화 조회라 항상 최신 좌표로 조회한다 — 라우트 전체를 동적으로 선언(no-store).
export const dynamic = "force-dynamic";

import { getFallbackNearbyStores, type NearbyStore } from "@/app/_lib/nearby-stores";

interface KakaoKeywordDoc {
  id?: string;
  place_name?: string;
  category_name?: string;
  distance?: string;
}

interface KakaoKeywordResponse {
  documents?: KakaoKeywordDoc[];
}

// 청과·채소·과일·마트를 아우르는 키워드 — Kakao 로컬 검색은 카테고리 코드가 아니라
// 키워드 검색이 청과·채소가게를 가장 잘 잡는다(대형마트만 카테고리 코드 MT1이 있음).
const KEYWORDS = ["청과", "채소가게", "과일가게", "마트"];
const RADIUS_M = 2000;
/** 카테고리명 마지막 계층만 남긴다 — "음식점 > 마트,편의점 > 대형마트" → "대형마트" */
function shortCategory(categoryName: string | undefined): string {
  if (!categoryName) return "가게";
  const parts = categoryName.split(">").map((s) => s.trim());
  return parts[parts.length - 1] || "가게";
}

async function searchKeyword(
  keyword: string,
  lat: number,
  lng: number,
  key: string,
): Promise<KakaoKeywordDoc[]> {
  const upstream = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  upstream.searchParams.set("query", keyword);
  upstream.searchParams.set("x", String(lng));
  upstream.searchParams.set("y", String(lat));
  upstream.searchParams.set("radius", String(RADIUS_M));
  upstream.searchParams.set("sort", "distance");
  const res = await fetch(upstream, {
    headers: { Authorization: `KakaoAK ${key}` },
    // 위치 기반 개인화 조회 — 캐시하지 않는다.
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as KakaoKeywordResponse;
  return Array.isArray(data.documents) ? data.documents : [];
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const district = searchParams.get("district") ?? "";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json(getFallbackNearbyStores(district));
  }

  const key = process.env.KAKAO_REST_KEY;
  if (!key) {
    return Response.json(getFallbackNearbyStores(district));
  }

  try {
    const results = await Promise.all(KEYWORDS.map((kw) => searchKeyword(kw, lat, lng, key)));
    const seen = new Set<string>();
    const stores: NearbyStore[] = [];

    for (const doc of results.flat()) {
      const id = doc.id;
      const name = doc.place_name;
      if (!id || !name || seen.has(id)) continue;
      seen.add(id);
      const distanceM = Number(doc.distance);
      stores.push({
        id,
        name,
        category: shortCategory(doc.category_name),
        distanceM: Number.isFinite(distanceM) ? distanceM : RADIUS_M,
      });
    }

    if (stores.length === 0) {
      return Response.json(getFallbackNearbyStores(district));
    }

    stores.sort((a, b) => a.distanceM - b.distanceM);
    return Response.json(stores.slice(0, 8));
  } catch {
    return Response.json(getFallbackNearbyStores(district));
  }
}
