import type { StoreRequest } from "./api/schemas/reports";

/** 지도와 제보 장소 선택 화면에서 항상 노출하는 테스트 매장 앵커. */
export const ASSADA_MART_CENTER = {
  lat: 37.5461281,
  lng: 126.955084,
} as const;

export const ASSADA_MART_IMAGE_PATH = "/marketgo-images/assada-mart-banner.png";
export const ASSADA_MART_STORE_ID = 999;

export const ASSADA_MART_STORE: StoreRequest = {
  id: String(ASSADA_MART_STORE_ID),
  placeName: "아싸다 마트",
  addressName: "서울 마포구 공덕동 242-90",
  roadAddressName: "서울 마포구 만리재옛길 19",
  x: ASSADA_MART_CENTER.lng,
  y: ASSADA_MART_CENTER.lat,
  distance: 0,
};
