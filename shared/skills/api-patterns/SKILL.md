---
name: api-patterns
description: API 레이어 구조 — BFF(Route Handler)·서버 fetch 함수·클라 훅의 3층 패턴. ApiError, zod 경계 검증, 훅 네이밍. api-developer/frontend-dev/code-reviewer가 참조.
---

# API 레이어 패턴 (BFF 3층)

> 전신(CSR·클라 fetch 래퍼 중심)과 다름 — **여기선 서버 함수가 1급이다.**

## 폴더 구조 (2026-08-18 실물 반영)

```
app/_lib/api/
  spring.ts        # 외부 Spring 호출 단일 창구 — springFetch/springRaw. `server-only`
  api-error.ts     # ApiError. ⚠️ 파일명이 error.ts면 Next가 에러 바운더리로 보고 빌드를 세운다
  tags.ts          # 캐시 태그 + REVALIDATE_IMMEDIATELY
  schemas/         # zod 스키마 + infer 타입 (도메인 1개 = 파일 1개)
  server/          # RSC·Server Action이 쓰는 서버 fetch 함수 — `server-only` 필수
  auth/
    tokens.ts      #   쿠키 이름·옵션·JWT exp 판단. **Edge에서도 import되므로 server-only 금지**
    session.ts     #   cookies() 기반 읽기/쓰기. `server-only`
  client/          # (아직 없음) "use client"용 TanStack Query 훅 — 화면이 필요해질 때
app/api/auth/      # 인증 BFF — kakao/(로그인) · reissue/ · logout/. 쿠키를 써야 해서 라우트여야 한다
proxy.ts           # 토큰 선제 갱신. Next 16에서 middleware→proxy로 개명됐다
```

⚠️ **프로토타입 더미와 이름이 겹치는 것들이 있다** — `getNearbyStores`·`searchRegions`·`Region`·
`NearbyStore`가 `app/_lib/nearby-stores.ts`·`app/_lib/regions.ts`에도 있다. 화면을 연결할 때
자동 import가 더미를 집어오면 **조용히 가짜 데이터가 뜬다.** import 경로를 눈으로 확인하고,
더미를 걷어낼 때 같이 정리한다.

**타입은 스키마 파일에 같이 둔다** (`export type X = z.infer<typeof xSchema>`). 별도 `types/` 폴더를
만들면 infer를 재수출하는 파일만 늘어나 barrel(conventions #2)에 가까워진다.

## 3층 규칙

1. **서버 함수 (`app/_lib/api/server/*`)** — RSC가 직접 호출. `server-only` 가드, Spring 토큰 사용 가능, `next: { revalidate, tags }` 명시, zod로 응답 파싱.
2. **BFF Route Handler (`app/api/*`)** — 클라 인터랙션이 부르는 표면. 내부에서 서버 함수 재사용. 클라에 필요한 모양으로 가공(over-fetch 차단).
3. **클라 훅 (`app/_lib/api/client/*`)** — TanStack Query로 BFF 호출. **Spring 직호출 금지** (토큰이 클라로 새는 경로).

## 이 백엔드(marketgo) 특수 규약

- **응답 envelope는 엔드포인트마다 다르다.** `{code,message,data}`로 감싼 것, DTO 그대로인 것, 최상위 배열인 것이 섞여 있다. → **공통 unwrap 유틸을 만들지 않는다.** 엔드포인트별 zod 스키마가 각자의 모양을 그대로 검증한다.
- **에러 body를 신뢰하지 않는다** — 스펙이 4xx/5xx에 성공 스키마를 재사용해 형식을 알 수 없다. BFF는 **HTTP status로 분기**해 `ApiError`를 만든다.
- **인증**: Spring accessToken(JWT)은 서버 함수·BFF에서만 `Authorization: Bearer`로 붙인다. refreshToken은 **쿠키** — BFF가 중계하며, `cookies()` 사용은 그 라우트를 동적으로 만든다(캐싱 판단에 반영).
- 스펙 조회·함정 목록은 **`backend-api-reference` 스킬**이 진실 소스. 필드는 항상 라이브 스펙에서 읽는다.

## 공통 규약

- **ApiError**: status·code·message 표준화 throw — 화면 에러 상태가 구분 처리
- **zod 경계 검증**: Spring 응답을 신뢰하지 않는다 — 스키마 parse 후 타입 확정 (`any` 원천 차단)
- **훅 네이밍**: Query `useGet*API` / Mutation `use[Action]*API`
- **queryKey 팩토리**: 도메인별 keys 객체로 중앙 관리
- 뮤테이션: Server Action 우선(+`revalidateTag`), 클라 편의 크면 TanStack Mutation 허용

## 안티패턴 (리뷰 flag)

- 클라 컴포넌트→Spring 직호출 (BFF 우회) = 🔴
- 모든 응답을 하나의 envelope로 가정한 공통 unwrap 유틸 (이 백엔드는 형태가 섞여 있다)
- `server-only` 가드 없는 서버 함수
- zod 없이 `as Type` 캐스팅으로 응답 신뢰
- BFF가 Spring 응답을 가공 없이 그대로 프록시만 (BFF 존재 이유 상실 — 필요성 재검토)
