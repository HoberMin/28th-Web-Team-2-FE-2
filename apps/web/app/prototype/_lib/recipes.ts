// 레시피 연계 — 콘텐츠 제작 없이 붙인 예시/더미. 실제 서비스에서는 레시피 제휴·크롤링으로 채운다.

export interface Recipe {
  id: string;
  vegetableId: string;
  title: string;
  minutes: number;
}

export const RECIPES: Recipe[] = [
  { id: "r-potato-1", vegetableId: "potato", title: "감자채볶음", minutes: 15 },
  { id: "r-potato-2", vegetableId: "potato", title: "감자조림", minutes: 25 },
  { id: "r-onion-1", vegetableId: "onion", title: "양파장아찌", minutes: 10 },
  { id: "r-garlic-1", vegetableId: "garlic", title: "마늘종볶음", minutes: 15 },
  { id: "r-tomato-1", vegetableId: "tomato", title: "토마토달걀볶음", minutes: 10 },
  { id: "r-cucumber-1", vegetableId: "cucumber", title: "오이무침", minutes: 10 },
  { id: "r-sweet-potato-1", vegetableId: "sweet-potato", title: "고구마맛탕", minutes: 20 },
  { id: "r-carrot-1", vegetableId: "carrot", title: "당근라페", minutes: 15 },
  { id: "r-corn-1", vegetableId: "corn", title: "옥수수치즈구이", minutes: 15 },
  { id: "r-bell-pepper-1", vegetableId: "bell-pepper", title: "피망잡채", minutes: 20 },
];

export function getRecipesFor(vegetableId: string): Recipe[] {
  return RECIPES.filter((r) => r.vegetableId === vegetableId);
}
