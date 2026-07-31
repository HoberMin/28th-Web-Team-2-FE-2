// 가격 등락 카드뉴스 — 콘텐츠 제작 없이 붙인 예시/더미. 실제 서비스에서는 시세 변동을 자동 요약해 채운다.
// 제목 카피는 한 틀로 고정한다: "{품목} 값, 한 달 새 {N}% {내렸어요|올랐어요}"
// (백로그 F08 — 수치형·무수치·이유형이 섞여 있으면 글끼리 비교가 안 된다). 이유 설명은 body가 맡는다.

export interface CardNewsItem {
  id: string;
  vegetableId: string;
  title: string;
  body: string;
  changePct: number;
}

/** 카드뉴스 전체가 참조하는 기준 시점 — 더미 콘텐츠 자체와 함께 고정값이다(자동 갱신 아님). */
export const CARD_NEWS_AS_OF = "2026-07-24";

export const CARD_NEWS: CardNewsItem[] = [
  {
    id: "cn-1",
    vegetableId: "onion",
    title: "양파 값, 한 달 새 12% 내렸어요",
    body: "장마가 끝나며 출하량이 늘었어요. 지금이 양파를 사기 좋은 시기예요.",
    changePct: -12,
  },
  {
    id: "cn-2",
    vegetableId: "garlic",
    title: "마늘 값, 한 달 새 8% 올랐어요",
    body: "저장 마늘 재고가 줄면서 가격이 올랐어요. 급하지 않다면 조금 기다려보세요.",
    changePct: 8,
  },
  {
    id: "cn-3",
    vegetableId: "tomato",
    title: "토마토 값, 한 달 새 6% 내렸어요",
    body: "노지 토마토 출하가 시작되며 가격이 내렸어요. 여름 제철이라 저렴해요.",
    changePct: -6,
  },
];
