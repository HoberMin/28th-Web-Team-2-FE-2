// 역지오코딩 BFF — 좌표(위경도) → 자치구.
// GPS 좌표 자체는 브라우저(navigator.geolocation)가 키 없이 얻는다. 이 라우트는 그 좌표를
// 한국 자치구 이름으로 바꾸는 역할만 한다. 3단 폴백으로 "키 없이도" 동작:
//   1) KAKAO_REST_KEY 있으면 Kakao(가장 정확)
//   2) 없으면 OpenStreetMap Nominatim(무료·키 불필요)
//   3) 둘 다 실패하면 강남구 선릉 폴백

interface KakaoRegionDoc {
  region_type: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

interface NominatimAddress {
  city_district?: string;
  borough?: string;
  county?: string;
  suburb?: string;
  city?: string;
  town?: string;
  municipality?: string;
  province?: string;
  state?: string;
}

const FALLBACK = { sido: "서울특별시", district: "강남구", dong: "선릉동" } as const;

function pickDistrict(addr: NominatimAddress): string | null {
  const vals = [
    addr.city_district,
    addr.borough,
    addr.county,
    addr.suburb,
    addr.municipality,
    addr.city,
    addr.town,
  ];
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
  return { sido: doc.region_1depth_name, district: doc.region_2depth_name, dong: doc.region_3depth_name };
}

async function viaNominatim(lat: number, lng: number) {
  const upstream = new URL("https://nominatim.openstreetmap.org/reverse");
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("lat", String(lat));
  upstream.searchParams.set("lon", String(lng));
  upstream.searchParams.set("zoom", "10");
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
