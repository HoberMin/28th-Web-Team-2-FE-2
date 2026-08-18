// 캐시 태그 — 조회에 붙인 태그와 뮤테이션의 무효화를 짝 맞추기 위해 한 곳에 모은다.
// 문자열을 각자 적으면 오타 하나로 무효화가 조용히 안 된다.

export const CACHE_TAGS = {
  items: "items",
  news: "news",
  regions: "regions",
  kamisDailyPrices: "kamis-daily-prices",
  /** 가게 목록은 좌표별로 갈리지만, 단골 토글은 전체를 한 번에 무효화한다. */
  stores: "stores",
} as const;
