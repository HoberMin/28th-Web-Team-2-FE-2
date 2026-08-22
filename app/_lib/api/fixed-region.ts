export const FIXED_REGION_ID = "1144010200";

/**
 * 위치 확인에 실패했을 때 시작할 동네 — 서울 마포구 공덕동.
 *
 * 온보딩이 검색 없이 "현재 위치 확인 → 확인/아니요"만으로 끝나기 때문에(2026-08-22 전환),
 * 위치 권한 거부·타임아웃·`/regions/nearby` 실패에서 사용자가 동네를 정할 수단이 없다.
 * 그래서 그 경우에는 되묻지 않고 이 동네로 시작하고, 화면에서 그 사실을 알린다.
 *
 * 값은 `FIXED_REGION_ID`와 같은 법정동이다 — 지금 품목·가게·제보 조회가 전부 이 코드로
 * 고정돼 있어(`server/items.ts`·`stores.ts`·`reports.ts`) 다른 동네를 기본값으로 두면
 * 화면의 동네 이름과 실제 데이터가 어긋난다.
 *
 * 좌표는 `app/_lib/regions-data.json`의 `seoul-마포구-공덕동` 값이다(주변 가게 조회용).
 */
export const FALLBACK_REGION = {
  regionId: FIXED_REGION_ID,
  regionName: "서울특별시 마포구 공덕동",
  latitude: 37.549119,
  longitude: 126.957786,
} as const;
