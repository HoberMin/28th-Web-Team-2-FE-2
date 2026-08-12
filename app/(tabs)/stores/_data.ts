import type { BadgeReportDateVariant } from "../../_components/badge-report-date";

// F03 동네가게 화면의 **더미 데이터**. Figma `화면GUI` 298:3605 / 3617 / 3630 / 3643 실측값이다.
//
// 왜 `app/_lib/`를 안 쓰나: `_lib/stores.ts`는 제보(Report) 목록을 가게 축으로 다시 묶는
// 프로토타입 도메인 집계라 입력으로 `reports-store`(브라우저 localStorage)가 필요하고,
// `_lib/store-locations.ts`는 동 중심 + 이름 해시로 좌표를 만든다. 둘 다 이 화면이 지금
// 필요로 하는 것(= Figma 프레임을 그대로 재현하는 고정 더미)보다 크고, 이번 사이클에서는
// 두 파일 모두 읽기 전용이다. 실데이터가 붙을 때 이 파일을 BFF 응답 타입으로 갈아끼운다.
//
// ⚠️ x/y 좌표는 Figma 프레임(390×844)의 마커 **중심**을 화면 본문 영역 기준 %로 환산한 값이다.
//    본문 영역 = 844 − 상단 Status Bar 44 − 하단 GNB 79 = 721px.
//    감사에서 확인된 규칙: icon(48) ↔ name(108) ↔ favorite(128)로 모습이 바뀌어도 **중심이 같다**
//    (예: 298:3653의 x=−10은 실수가 아니라 128px 알약의 중심 보존 결과). 그래서 좌표를
//    좌상단이 아니라 중심으로 들고, 마커는 translate(-50%,-50%)로 앉힌다.
//
//      농협하나로마트  center(195, 362) → 50.0% / 44.1%
//      행복슈퍼마켓    center( 54, 305) → 13.8% / 36.2%
//      우리동네청과    center(307, 425) → 78.7% / 52.8%
//      자양시장 채소가게 center(101, 501) → 25.9% / 63.4%
//
//    lat/lng는 이 퍼센트 좌표를 광진구 중심 주변으로 투영한 임시 WGS84 좌표다. 이제 마커 위치는
//    카카오맵 projection에서 계산하므로 줌·이동에 맞춰 실제로 움직인다. 실 API 연결 시 lat/lng를
//    응답 좌표로 교체하고 x/y는 SDK 실패 폴백으로만 남긴다.
//
// ⚠️ Figma는 마커 4개의 이름이 전부 "농협하나로마트"다(심볼 기본값을 그대로 둔 자리표시).
//    같은 이름 4개로는 선택·찜·말줄임 어느 것도 눈으로 확인할 수 없어서 나머지 3개에 다른
//    상호명을 넣었다. **시트에 뜨는 농협하나로마트의 값은 전부 Figma 원본이다.**
//
// ⚠️ 지역명: 배지는 "광진구", 지도 래스터에는 "천안"이 찍혀 있어 원본이 서로 어긋난다.
//    지도가 플레이스홀더라 무해하지만 더미는 배지 쪽(광진구)으로 통일했다.

export interface StoreReportItem {
  id: string;
  /** 야채 이름 */
  name: string;
  date: BadgeReportDateVariant;
  /** 가격 문자열. 예: "99,900원" */
  price: string;
  /** 단위 문자열. 예: "/100kg" */
  unit: string;
}

export interface MapStore {
  id: string;
  name: string;
  /** 카카오맵에 표시할 위도(WGS84). 실 API 연결 시 응답 좌표로 교체한다. */
  lat: number;
  /** 카카오맵에 표시할 경도(WGS84). 실 API 연결 시 응답 좌표로 교체한다. */
  lng: number;
  /** 지도 영역 기준 마커 중심 가로 위치(%) */
  x: number;
  /** 지도 영역 기준 마커 중심 세로 위치(%) */
  y: number;
  openState: string;
  openHours: string;
  distance: string;
  walkTime: string;
  affordableCount: number;
  todayReportCount: number;
  reports: StoreReportItem[];
}

/** 배지에 뜨는 지역명. */
export const MAP_REGION = "광진구";

/** F03 카카오맵의 최초 중심. */
export const MAP_CENTER = { lat: 37.5384, lng: 127.0822 } as const;

// 현재 Figma 더미는 화면 퍼센트 좌표만 있으므로 광진구 중심 주변의 지도 좌표로 변환한다.
// 실제 가게 API 좌표가 붙으면 각 데이터의 lat/lng만 응답 값으로 교체하면 된다.
const MAP_LAT_SPAN = 0.013;
const MAP_LNG_SPAN = 0.017;

function mapCoordinate(x: number, y: number): { lat: number; lng: number } {
  return {
    lat: MAP_CENTER.lat + ((50 - y) / 100) * MAP_LAT_SPAN,
    lng: MAP_CENTER.lng + ((x - 50) / 100) * MAP_LNG_SPAN,
  };
}

export const MAP_STORES: MapStore[] = [
  {
    // Figma 시트(298:3629)에 실제로 펼쳐져 있는 가게. 아래 값은 전부 Figma 원본이다.
    id: "nh-haniro",
    name: "농협하나로마트",
    ...mapCoordinate(50.0, 44.1),
    x: 50.0,
    y: 44.1,
    openState: "영업중",
    openHours: "수 10:00 - 22:00",
    distance: "670m",
    walkTime: "도보 10분",
    affordableCount: 4,
    todayReportCount: 1,
    reports: [
      { id: "nh-1", name: "양파", date: "today", price: "99,900원", unit: "/100kg" },
      { id: "nh-2", name: "양파", date: "yesterday", price: "99,900원", unit: "/100kg" },
    ],
  },
  {
    // 아래 3개는 Figma에 상세가 없어 만든 더미다(위 ⚠️ 참고).
    id: "happy-super",
    name: "행복슈퍼마켓",
    ...mapCoordinate(13.8, 36.2),
    x: 13.8,
    y: 36.2,
    openState: "영업중",
    openHours: "수 09:00 - 21:00",
    distance: "320m",
    walkTime: "도보 5분",
    affordableCount: 2,
    todayReportCount: 3,
    reports: [
      { id: "hs-1", name: "감자", date: "today", price: "3,200원", unit: "/1kg" },
      { id: "hs-2", name: "대파", date: "today", price: "2,480원", unit: "/1단" },
    ],
  },
  {
    id: "uri-cheonggwa",
    name: "우리동네청과",
    ...mapCoordinate(78.7, 52.8),
    x: 78.7,
    y: 52.8,
    openState: "영업종료",
    openHours: "수 08:00 - 19:00",
    distance: "1.2km",
    walkTime: "도보 18분",
    affordableCount: 5,
    todayReportCount: 0,
    // 최근 제보가 아직 없는 가게 — section/recent-report의 empty 심볼(392-12709)이
    // 실제로 쓰이는 자리다. 찜 여부와는 무관하다(감사 🔴 #2 참고).
    reports: [],
  },
  {
    id: "jayang-market",
    name: "자양시장 채소가게 2호점",
    ...mapCoordinate(25.9, 63.4),
    x: 25.9,
    y: 63.4,
    openState: "영업중",
    openHours: "수 07:00 - 20:00",
    distance: "850m",
    walkTime: "도보 13분",
    affordableCount: 3,
    todayReportCount: 2,
    reports: [
      { id: "jm-1", name: "오이", date: "today", price: "1,190원", unit: "/1개" },
      { id: "jm-2", name: "애호박", date: "yesterday", price: "1,980원", unit: "/1개" },
    ],
  },
];

/**
 * 처음에 찜돼 있는 가게.
 *
 * Figma 프레임끼리 어긋나서 한쪽을 골라야 했다 — 298:3617(가게선택)은 농협하나로마트가
 * **안 찜된** 상태이고, 298:3643(찜한가게)은 마커 4개가 **전부 찜된** 상태다. 둘 다 만족하는
 * 초기값은 없다. 그래서 "농협하나로마트는 안 찜, 나머지 중 2곳은 찜"으로 잡았다:
 *   · 298:3617 → 298:3630 (찜 누르기) 전환이 그대로 재현되고,
 *   · 찜 필터를 켰을 때 보여 줄 것이 있고,
 *   · 시트에서 찜을 모두 풀면 빈 상태까지 실제로 도달한다.
 */
export const INITIAL_FAVORITE_IDS = ["happy-super", "jayang-market"];
