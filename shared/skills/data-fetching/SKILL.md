---
name: data-fetching
description: 데이터 페칭·캐싱 규율 — Next 캐싱 적극 활용(이 프로젝트 학습 목표). fetch revalidate/tags 의무, revalidateTag 짝, unstable_cache, 클라는 TanStack Query. api-developer/frontend-dev/code-reviewer가 참조.
---

# 데이터 페칭 & 캐싱 (적극 활용 — 이 프로젝트의 학습 목표)

> 출처: nextjs.org/docs caching (공식). **모든 fetch에 캐싱 의도 명시가 규약** (conventions #11).

## 캐싱 4층 (Next.js)

| 층 | 무엇 | 제어 |
|---|---|---|
| Request Memoization | 한 렌더 내 같은 fetch dedupe | 자동 (활용: 여러 RSC에서 그냥 각각 fetch) |
| **Data Cache** | fetch 응답 서버 캐시 | `next: { revalidate, tags }` / `no-store` |
| **Full Route Cache** | 정적 라우트 HTML+RSC payload | 정적 유지가 기본, 동적 API 쓰면 opt-out |
| Router Cache | 클라 내비게이션 캐시 | 자동 |

## 규율

**1. fetch마다 의도 명시 (의무)**
```ts
// 자주 안 변함 → 시간 재검증
fetch(url, { next: { revalidate: 3600, tags: ['products'] } })
// 뮤테이션과 짝 맞춰 무효화할 것 → tags 필수
fetch(url, { next: { tags: [`post-${id}`] } })
// 항상 최신 (개인화·실시간) → 명시적 no-store
fetch(url, { cache: 'no-store' })
```
아무것도 안 쓴 fetch = 의도 불명 → 리뷰 flag.

**2. 뮤테이션엔 무효화 짝 (의무)**
Server Action / BFF 뮤테이션 → `revalidateTag('products')` 또는 `revalidatePath('/products')`. 무효화 없는 뮤테이션 = stale 화면 = 🔴.

**3. 라우트 단위 선언**
`export const revalidate = 3600` / `export const dynamic = 'force-static' | 'force-dynamic'` — 페이지 성격을 라우트 상단에 선언. **정적 유지가 기본**, `cookies()`·`headers()` 등 동적 API는 필요할 때만(쓰는 순간 라우트 전체가 동적으로 전환됨을 인지).

**4. 비-fetch 데이터**
외부 SDK·무거운 연산은 `unstable_cache(fn, keys, { revalidate, tags })`.

**5. 클라이언트는 TanStack Query**
"use client" 안의 인터랙티브 데이터(폴링·낙관적 업데이트·무한스크롤)만. **첫 로드 데이터는 RSC** — 클라 페칭으로 옮기지 않는다. 훅 네이밍 `useGet*API`/`use[Action]*API` (`api-patterns`).

## 안티패턴 (리뷰 flag)

- 캐싱 옵션 없는 fetch / 무효화 없는 뮤테이션
- 개인화 데이터에 revalidate 캐시 (유저 간 데이터 샘) = 🔴
- 정적이어도 되는 라우트를 `force-dynamic`으로
- 첫 로드 데이터의 useEffect/TanStack 페칭
