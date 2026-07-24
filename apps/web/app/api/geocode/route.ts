// 역지오코딩 BFF — 좌표(위경도) → 자치구. 외부 Kakao Local API 앞단 프록시.
// 인증키(KAKAO_REST_KEY)는 서버 env에만(conventions #7). 키 미수령/실패 시 폴백(강남구 선릉).

interface KakaoRegionDoc {
  region_type: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

const FALLBACK = { sido: "서울특별시", district: "강남구", dong: "선릉동" } as const;

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const key = process.env.KAKAO_REST_KEY;

  // BFF 진입점 입력 검증 — 숫자 좌표만 상류(Kakao)로 전달 (쿼리 인젝션 차단).
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !key) {
    return Response.json(FALLBACK);
  }

  try {
    const upstream = new URL("https://dapi.kakao.com/v2/local/geo/coord2regioncode.json");
    upstream.searchParams.set("x", String(lng));
    upstream.searchParams.set("y", String(lat));
    const res = await fetch(upstream, {
      headers: { Authorization: `KakaoAK ${key}` },
      cache: "no-store",
    });
    if (!res.ok) return Response.json(FALLBACK);

    const data = (await res.json()) as { documents?: KakaoRegionDoc[] };
    const doc = data.documents?.find((d) => d.region_type === "H") ?? data.documents?.[0];
    if (!doc) return Response.json(FALLBACK);

    return Response.json({
      sido: doc.region_1depth_name,
      district: doc.region_2depth_name,
      dong: doc.region_3depth_name,
    });
  } catch {
    return Response.json(FALLBACK);
  }
}
