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
 * 태그 무효화 시 넘기는 캐시 수명.
 *
 * Next 16에서 `revalidateTag(tag)`가 `revalidateTag(tag, profile)` 2인자로 바뀌었는데,
 * **프로필 이름을 넘기면 즉시 무효화가 되지 않는다.** 캐시 핸들러가
 * `expired = now + profile.expire`로 쓰기 때문에(`file-system-cache.js`),
 * `"max"`를 넘기면 만료 시점이 1년 뒤로 밀려 stale 값이 한 번 더 서빙된다.
 * 뮤테이션 직후 자기 변경을 못 보는 상태가 된다.
 *
 * `{ expire: 0 }`이면 `expired = now`가 되어 다음 읽기가 하드 미스가 된다.
 * (`updateTag()`는 Server Action 전용이라 Route Handler에서 부르면 throw한다.)
 */
export const REVALIDATE_IMMEDIATELY = { expire: 0 } as const;
