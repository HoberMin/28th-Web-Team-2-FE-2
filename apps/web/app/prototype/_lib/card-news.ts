// 가격 등락 카드뉴스 — 콘텐츠 제작 없이 붙인 예시/더미. 실제 서비스에서는 시세 변동을 자동 요약해 채운다.

export interface CardNewsItem {
  id: string;
  vegetableId: string;
  title: string;
  body: string;
  changePct: number;
}

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
    title: "마늘은 아직 비싼 편이에요",
    body: "저장 마늘 재고가 줄면서 가격이 8% 올랐어요. 급하지 않다면 조금 기다려보세요.",
    changePct: 8,
  },
  {
    id: "cn-3",
    vegetableId: "tomato",
    title: "토마토, 여름 제철이라 저렴해요",
    body: "노지 토마토 출하가 시작되며 가격이 6% 내렸어요.",
    changePct: -6,
  },
];
