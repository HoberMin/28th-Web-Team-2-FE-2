/**
 * Figma에서 받은 채소 벡터 10종만 화면 채소 이미지로 사용한다.
 *
 * 품목은 46종이지만 현재 에셋이 10종뿐이므로 비슷한 품목끼리 같은 벡터를 재사용한다.
 * 백엔드 이미지 URL이나 실물 사진으로 대체하지 않는 것이 이 매핑의 규칙이다.
 */
const VEGETABLE_VECTOR_BY_ID: Readonly<Record<string, string>> = Object.freeze({
  potato: "/veg/potato.svg",
  "sweet-potato": "/veg/sweet-potato.svg",
  garlic: "/veg/garlic.svg",
  onion: "/veg/onion.svg",
  carrot: "/veg/carrot.svg",
  tomato: "/veg/tomato.svg",
  "bell-pepper": "/veg/bell-pepper.svg",
  cucumber: "/veg/cucumber.svg",
  "red-pepper": "/veg/red-pepper.svg",
  broccoli: "/veg/broccoli.svg",

  // 10종 벡터를 품목 형태가 가까운 순서로 재사용한다.
  ginger: "/veg/carrot.svg",
  "cherry-tomato": "/veg/tomato.svg",
  "date-cherry-tomato": "/veg/tomato.svg",
  paprika: "/veg/bell-pepper.svg",
  "zucchini-korean": "/veg/cucumber.svg",
  zucchini: "/veg/cucumber.svg",
  "green-pepper": "/veg/red-pepper.svg",
  "kkwari-pepper": "/veg/red-pepper.svg",
  "cheongyang-pepper": "/veg/red-pepper.svg",
  "mild-pepper": "/veg/red-pepper.svg",
  "dried-pepper": "/veg/red-pepper.svg",
  "pepper-powder-kr": "/veg/red-pepper.svg",
  "pepper-powder-cn": "/veg/red-pepper.svg",
  "napa-cabbage": "/veg/broccoli.svg",
  radish: "/veg/carrot.svg",
  "baby-napa-cabbage": "/veg/broccoli.svg",
  "young-napa-cabbage": "/veg/broccoli.svg",
  cabbage: "/veg/broccoli.svg",
  "young-radish": "/veg/carrot.svg",
  spinach: "/veg/broccoli.svg",
  "red-lettuce": "/veg/broccoli.svg",
  "green-lettuce": "/veg/broccoli.svg",
  "perilla-leaf": "/veg/broccoli.svg",
  "water-parsley": "/veg/broccoli.svg",
  "welsh-onion": "/veg/onion.svg",
  chive: "/veg/onion.svg",
  "mustard-green": "/veg/broccoli.svg",
  "oyster-mushroom": "/veg/garlic.svg",
  "enoki-mushroom": "/veg/garlic.svg",
  "king-oyster-mushroom": "/veg/garlic.svg",
  sesame: "/veg/garlic.svg",
  peanut: "/veg/potato.svg",
  watermelon: "/veg/tomato.svg",
  "korean-melon": "/veg/cucumber.svg",
  melon: "/veg/cucumber.svg",
  strawberry: "/veg/tomato.svg",
});

const VEGETABLE_ID_BY_NAME: Readonly<Record<string, string>> = Object.freeze({
  감자: "potato",
  고구마: "sweet-potato",
  마늘: "garlic",
  양파: "onion",
  당근: "carrot",
  생강: "ginger",
  토마토: "tomato",
  방울토마토: "cherry-tomato",
  대추방울토마토: "date-cherry-tomato",
  피망: "bell-pepper",
  파프리카: "paprika",
  오이: "cucumber",
  애호박: "zucchini-korean",
  쥬키니: "zucchini",
  풋고추: "green-pepper",
  꽈리고추: "kkwari-pepper",
  청양고추: "cheongyang-pepper",
  오이맛고추: "mild-pepper",
  붉은고추: "red-pepper",
  건고추: "dried-pepper",
  "고춧가루-국산": "pepper-powder-kr",
  "고춧가루(국산)": "pepper-powder-kr",
  "고춧가루-중국산": "pepper-powder-cn",
  "고춧가루(중국산)": "pepper-powder-cn",
  배추: "napa-cabbage",
  무: "radish",
  알배기배추: "baby-napa-cabbage",
  얼갈이배추: "young-napa-cabbage",
  양배추: "cabbage",
  열무: "young-radish",
  시금치: "spinach",
  적상추: "red-lettuce",
  청상추: "green-lettuce",
  깻잎: "perilla-leaf",
  미나리: "water-parsley",
  대파: "welsh-onion",
  쪽파: "chive",
  브로콜리: "broccoli",
  갓: "mustard-green",
  느타리버섯: "oyster-mushroom",
  팽이버섯: "enoki-mushroom",
  새송이버섯: "king-oyster-mushroom",
  참깨: "sesame",
  땅콩: "peanut",
  수박: "watermelon",
  참외: "korean-melon",
  멜론: "melon",
  딸기: "strawberry",
});

const DEFAULT_VEGETABLE_VECTOR_IMAGE = VEGETABLE_VECTOR_BY_ID.onion;

export function getVegetableVectorImageById(id: string): string {
  return VEGETABLE_VECTOR_BY_ID[id] ?? DEFAULT_VEGETABLE_VECTOR_IMAGE;
}

export function getVegetableVectorImage(name: string): string {
  const id = VEGETABLE_ID_BY_NAME[name];
  return id ? getVegetableVectorImageById(id) : DEFAULT_VEGETABLE_VECTOR_IMAGE;
}
