const PRICE_VEGETABLE_IMAGES = [
  ["potato", "감자"],
  ["sweet-potato", "고구마"],
  ["garlic", "마늘"],
  ["onion", "양파"],
  ["carrot", "당근"],
  ["ginger", "생강"],
  ["tomato", "토마토"],
  ["cherry-tomato", "방울토마토"],
  ["date-cherry-tomato", "대추방울토마토"],
  ["bell-pepper", "피망"],
  ["paprika", "파프리카"],
  ["cucumber", "오이"],
  ["zucchini-korean", "애호박"],
  ["zucchini", "쥬키니"],
  ["green-pepper", "풋고추"],
  ["kkwari-pepper", "꽈리고추"],
  ["cheongyang-pepper", "청양고추"],
  ["mild-pepper", "오이맛고추"],
  ["red-pepper", "붉은고추"],
  ["dried-pepper", "건고추"],
  ["pepper-powder-kr", "고춧가루-국산"],
  ["pepper-powder-cn", "고춧가루-중국산"],
  ["napa-cabbage", "배추"],
  ["radish", "무"],
  ["baby-napa-cabbage", "알배기배추"],
  ["young-napa-cabbage", "얼갈이배추"],
  ["cabbage", "양배추"],
  ["young-radish", "열무"],
  ["spinach", "시금치"],
  ["red-lettuce", "적상추"],
  ["green-lettuce", "청상추"],
  ["perilla-leaf", "깻잎"],
  ["water-parsley", "미나리"],
  ["welsh-onion", "대파"],
  ["chive", "쪽파"],
  ["broccoli", "브로콜리"],
  ["mustard-green", "갓"],
  ["oyster-mushroom", "느타리버섯"],
  ["enoki-mushroom", "팽이버섯"],
  ["king-oyster-mushroom", "새송이버섯"],
  ["sesame", "참깨"],
  ["peanut", "땅콩"],
  ["watermelon", "수박"],
  ["korean-melon", "참외"],
  ["melon", "멜론"],
  ["strawberry", "딸기"],
] as const;

export const FALLBACK_PRICE_VEGETABLE_IMAGE =
  "/figma/design-library/images/vegetable-grid.png";

// 시세 탭은 백엔드 itemImageUrl 대신 프런트에 모아 둔 46종 실물 사진을 사용한다.
// id 맵은 기존 더미 목록이, 이름 맵은 Spring 품목 목록이 공유한다.
export const PRICE_VEGETABLE_IMAGE_BY_ID: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    PRICE_VEGETABLE_IMAGES.map(([id]) => [id, `/vegetables/coupang/${id}.webp`]),
  ),
);

export const PRICE_VEGETABLE_IMAGE_BY_NAME: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(
    PRICE_VEGETABLE_IMAGES.map(([id, name]) => [name, `/vegetables/coupang/${id}.webp`]),
  ),
  // 프런트 카탈로그의 괄호 표기와 라이브 API의 하이픈 표기를 모두 받는다.
  "고춧가루(국산)": "/vegetables/coupang/pepper-powder-kr.webp",
  "고춧가루(중국산)": "/vegetables/coupang/pepper-powder-cn.webp",
});

export function getPriceVegetableImage(name: string): string {
  return PRICE_VEGETABLE_IMAGE_BY_NAME[name] ?? FALLBACK_PRICE_VEGETABLE_IMAGE;
}

const VEGETABLE_ID_BY_NAME: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(PRICE_VEGETABLE_IMAGES.map(([id, name]) => [name, id])),
  // 프런트 카탈로그의 괄호 표기와 라이브 API의 하이픈 표기를 모두 받는다(위 이미지 맵과 동일 이유).
  "고춧가루(국산)": "pepper-powder-kr",
  "고춧가루(중국산)": "pepper-powder-cn",
});

/** Spring 응답의 `itemName`(라이브 표기)을 46종 더미 카탈로그의 slug id로 되짚는다. */
export function getVegetableIdByName(name: string): string | undefined {
  return VEGETABLE_ID_BY_NAME[name];
}
