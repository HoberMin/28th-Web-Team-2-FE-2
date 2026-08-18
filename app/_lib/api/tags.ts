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

/**
 * 태그 무효화 시 쓰는 캐시 프로필.
 *
 * Next 16에서 `revalidateTag(tag)`가 `revalidateTag(tag, profile)` 2인자로 바뀌었다.
 * 프로필은 "얼마나 오래된 항목까지 만료시킬지"를 정하는데, 뮤테이션 후 무효화는
 * **나이와 무관하게 전부 지워야** 하므로 가장 넓은 `max`(1년)를 쓴다.
 */
export const REVALIDATE_PROFILE = "max";
