// 역지오코딩 BFF — 좌표(위경도) → 동네(동 우선, 동 없으면 구·시).
// GPS 좌표 자체는 브라우저(navigator.geolocation)가 키 없이 얻는다. 이 라우트는 그 좌표를
// 한국 동네 이름으로 바꾸는 역할만 한다. 3단 폴백으로 "키 없이도" 동작:
//   1) KAKAO_REST_KEY 있으면 Kakao(가장 정확)
//   2) 없으면 OpenStreetMap Nominatim(무료·키 불필요)
//   3) 둘 다 실패하면 삼성동(UT 테스트 장소) 폴백
//
// 좌표마다 결과가 다르고 외부 API를 실시간으로 부르므로 캐싱하지 않는다 (conventions #11).

export const dynamic = "force-dynamic";

interface KakaoRegionDoc {
  region_type: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

interface NominatimAddress {
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  city_district?: string;
  borough?: string;
  county?: string;
  city?: string;
  town?: string;
  municipality?: string;
  province?: string;
  state?: string;
}

const FALLBACK = { sido: "서울특별시", district: "삼성동", dong: "삼성동" } as const;

/** "삼성1동" → "삼성동" — 행정동 세분화 접미 숫자를 떼어 법정동 이름으로 정규화(REGIONS 라벨과 정합). */
function normalizeDong(name: string): string {
  return name.replace(/\d+동$/, "동");
}

/** 동(행정동/법정동) 후보를 우선, 없으면 구·시로 폴백 — REGIONS는 동 단위라 동을 최우선한다. */
function pickDistrict(addr: NominatimAddress): string | null {
  // 실측(2026-07-30): 서울 행정동은 suburb("삼성1동"), 경기 동은 quarter("우만동", zoom≥14에서만)로 온다.
  const dongCandidate = [addr.neighbourhood, addr.quarter, addr.suburb].find((v) => v && /동$/.test(v));
  if (dongCandidate) return normalizeDong(dongCandidate);

  const vals = [addr.city_district, addr.borough, addr.county, addr.municipality, addr.city, addr.town];
  const isGu = (v?: string) => !!v && /(구|군)$/.test(v);
  const isSi = (v?: string) => !!v && /시$/.test(v) && !/(특별시|광역시|특별자치시)$/.test(v);
  return vals.find(isGu) ?? vals.find(isSi) ?? null;
}

async function viaKakao(lat: number, lng: number, key: string) {
  const upstream = new URL("https://dapi.kakao.com/v2/local/geo/coord2regioncode.json");
  upstream.searchParams.set("x", String(lng));
  upstream.searchParams.set("y", String(lat));
  const res = await fetch(upstream, {
    headers: { Authorization: `KakaoAK ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { documents?: KakaoRegionDoc[] };
  const doc = data.documents?.find((d) => d.region_type === "H") ?? data.documents?.[0];
  if (!doc) return null;
  // REGIONS(regions.ts)가 동 단위라 3depth(동)를 최우선 채택 — 정규화 실패(동이 아닌 값)면 구로 폴백.
  const dong = doc.region_3depth_name && /동$/.test(doc.region_3depth_name) ? normalizeDong(doc.region_3depth_name) : null;
  return { sido: doc.region_1depth_name, district: dong ?? doc.region_2depth_name, dong: doc.region_3depth_name };
}

async function viaNominatim(lat: number, lng: number) {
  const upstream = new URL("https://nominatim.openstreetmap.org/reverse");
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("lat", String(lat));
  upstream.searchParams.set("lon", String(lng));
  // zoom=10은 시 단위 결과라 경기 지역에서 동(quarter)이 아예 안 옴 — 동 단위가 필요해 14로 상향.
  // 서울/경기 좌표 실측 완료(2026-07-30): zoom=14에서도 구·시 필드(borough/city_district/city)는 함께 오므로 폴백 유지.
  upstream.searchParams.set("zoom", "14");
  upstream.searchParams.set("accept-language", "ko");
  const res = await fetch(upstream, {
    // Nominatim 이용약관: 유효한 User-Agent 필수.
    headers: { "User-Agent": "veg-price-prototype (UT demo)" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { address?: NominatimAddress };
  if (!data.address) return null;
  const district = pickDistrict(data.address);
  if (!district) return null;
  return { sido: data.address.state ?? data.address.province ?? "", district, dong: "" };
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  // 좌표 숫자 검증 — 숫자만 상류로 전달(쿼리 인젝션 차단).
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json(FALLBACK);
  }

  try {
    const key = process.env.KAKAO_REST_KEY;
    const result = (key && (await viaKakao(lat, lng, key))) || (await viaNominatim(lat, lng));
    return Response.json(result ?? FALLBACK);
  } catch {
    return Response.json(FALLBACK);
  }
}
