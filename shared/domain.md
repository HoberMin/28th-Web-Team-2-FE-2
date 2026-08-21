# 도메인 (단일 진실 소스 · 도구 무관)

> 채울 때마다 이 문서를 갱신 → Claude/Codex 양쪽이 같이 참조. **미정은 추측 금지, `TODO(✍️)`로.**
> 페이지 단위 상세 스펙은 → `shared/product-spec.md`
> **⚠️ 스켈레톤 상태** — 서비스가 정의되면 채운다. 전신(looky) 도메인은 이식하지 않았다.

## 0. 제품 경계
- `TODO(✍️):` 서비스명/도메인
- `TODO(✍️):` 한 줄 정의
- `TODO(✍️):` 회원/비회원 모델 (인증·세션·재방문 설계의 전제)

## 1. 비즈니스 & 서비스
- `TODO(✍️):` 핵심 가치 / 수익 모델 / 타겟 / 유입 채널

## 2. 핵심 구조
- **인증·식별 (2026-08-18 확정)**: 카카오 OIDC `idToken` → 우리 BFF(`app/api/auth/kakao`) → 외부 Spring이 서비스 JWT 발급. **토큰은 우리 도메인 httpOnly 쿠키에 보관**하고 서버가 `Authorization` 헤더로 붙인다(브라우저 메모리 보관 안 함 — RSC가 못 읽는다). 갱신은 루트 `proxy.ts`가 렌더 전에 선제 수행. 규격은 `auth-session` 스킬
  - `TODO(✍️):` 회원/비회원 경계 — 비회원이 어디까지 쓰는지 미정이라 보호 라우트 접근 제어를 아직 안 걸었다 (`농산물-문서/be-요청사항.md` 3번)
  - **신규/기존 회원 구분 (2026-08-19 해소)**: BE가 `GET /api/v1/users/me`를 신설해
    `onboardingStep`("NICKNAME"|"REGION"|"COMPLETED")을 내려준다. 로그인 콜백
    (`app/api/auth/kakao/callback/route.ts`)이 로그인 직후 이 값을 조회해 `COMPLETED`면
    바로 홈으로, 아니면 `onboardingStep`을 쿼리로 실어 `/onboarding`으로 보내 이미 끝난
    단계(닉네임 등)를 건너뛴다. `TODO(✍️):` 새 기기로 처음 접속한 완료 유저는 로컬
    `onboarding-store`(브라우저 저장소)가 비어 있어 `(tabs)/_onboarding-gate.tsx`가 여전히
    `/onboarding`으로 되돌려보낸다 — 그 게이트가 로컬 상태만 보고 서버 진행 단계를 조회하지
    않기 때문이다(이번 작업 범위 밖, 별도 확인 필요).
- **BE 계약 커버리지 (2026-08-20 전수 대조)**: Swagger 27개 중 프로덕트 엔드포인트는 전부
  프론트에 붙었다(샘플 `/api/samples` 제외). 이날 새로 연결한 것 — 가게 단골 토글
  (`PUT|DELETE /stores/{id}/favorite`) · 단골 목록(`/users/me/favorite-stores`) · 가게 제보
  목록(`/stores/{id}/reports`) · 추천 가게(`/stores/recommendation`) · 동네 최저가
  (`/regions/{id}/reports/lowest-prices`) · 이미지 업로드(`POST /images`).
  같이 걷어낸 더미 — `SAVED_STORES` · `HOME_RECOMMENDED_STORE` · `HOME_LOWEST_VEGETABLES` ·
  `HOME_REGION` · `MAP_STORES`/`PrototypeMapStore` · 가게 상세의 `FIGMA_ONION_PRICES`와
  `/stores/temporary` 경로.
- **2026-08-21 해소 (BE가 만들어 프론트가 연결함)**: 품목별 동네 제보 목록
  (`GET /regions/{regionId}/items/{itemId}/reports`) · 주간 가격 추이(`/items/{id}/public-prices`) ·
  온라인 쇼핑몰 가격 비교(`/items/{id}/online-prices`) · 내 제보 목록·수정·삭제·주간 현황
  (`/users/me/reports*`) · 가게 상세 조회(`GET /stores/{storeId}` — 이름·주소·영업시간·사진) ·
  제보 사진 인식(`/user-reports/image-analysis`).
  가게 **단골 수**는 `StoreDetailResponse.favoriteCount`로 와서 하트 아래 숫자를 되살렸다.
- **여전히 막힌 것** (`농산물-문서/be-요청-2026-08-21-디자인QA.md` 대상):
  - 「오늘 제보된 품목」 수 — 응답이 `totalReportedItemCount`(누적)뿐이라 2번 배지는
    「비싼 야채」 수로 대체돼 있다
  - 품목 카테고리 「깨·견과류」 · 품목 정렬 「시세보다 저렴한 순」·「최근 제보순」
  - **공공가격·온라인가 데이터 미적재** — 엔드포인트는 있는데 라이브 응답이 비어 있다
    (2026-08-21 재확인: `items`의 `price`·`baseDate` 전부 null, `public-prices.points`·
    `online-prices` 빈 배열). 그래서 그래프·온라인 비교·시세 카드가 아직 더미 폴백이다
  - 가게 상세의 `businessHours`가 빈 배열 · `openStatus`가 `UNKNOWN` (카카오 영업시간 미적재)
  - 가게 상세에 전화번호 필드 없음 — 직전 화면 쿼리로만 온다
- `TODO(✍️):` 유저 플로우
- `TODO(✍️):` 핵심 엔티티·상태머신
  - **품목 식별자 계약 (2026-08-18 해소)**: `GET /api/v1/items/{itemId}` 상세 조회가 라이브에
    확인돼 `/prices/[itemId]`의 라우트 파라미터가 46종 prototype 영문 slug 대신 Spring의 숫자
    `itemId`를 그대로 쓰도록 바뀌었다. `/prices` 목록 카드도 이 숫자 id로 상세에 연결된다.
    다만 상세 API는 요약 수치(품목명·단위·오늘 공공시세·어제 대비·최근 동네 제보가·온라인
    최저가 1개·찜 여부)만 준다. **주간 가격 추이 그래프·동네 제보 목록·온라인 쇼핑몰별 가격
    비교**는 2026-08-21에 전용 엔드포인트가 생겨 연결했지만 **데이터가 아직 비어 있어**, 응답이
    빈 동안은 API가 돌려주는 `itemName`으로 46종 더미 카탈로그
    항목을 찾아(숫자→slug 매핑 아님, 이름 일치) 더미로 채운다. 매칭 실패 시 그 섹션들만
    건너뛰고 요약 카드는 실데이터로 보인다.

## 3. 아키텍처 제약 (확정분)
- **단일 루트 Next.js 프로젝트** (2026-08-05 모노레포 해체): 루트 `app/`(App Router). 디자인 시스템은 서비스에 병합 — `app/_components/`(공통 컴포넌트) + `app/globals.css` `@theme`(토큰)
- **풀 RSC + BFF** — Server Component 기본, `app/api/*` Route Handler가 외부 Spring 앞단. 상세 → `conventions.md`
- 외부 백엔드: **Spring (별도 레포)** — 스펙: marketgo Swagger `https://api.marketgo.kro.kr/v3/api-docs` (2026-08-18 확보). 인증은 JWT Bearer + refreshToken 쿠키. 읽는 법·함정은 `backend-api-reference` 스킬
- 캐싱 적극 활용 (revalidate/tags 명시 의무) → `data-fetching` 스킬

## 4. 코딩 컨벤션
→ `conventions.md`. 도메인 특화 규칙은 생기면 여기에.

## 5. UI 원칙
- **모바일 퍼스트** (확정)
- **타이포·폰트**: Wanted Sans 1종 + Figma `title`/`body`/`caption` 21종 (node 171-3737 최종본, 2026-08-05). 구 Pretendard·head1/head2 체계 폐기
- **상태 3종 필수**: 로딩 / 에러 / 빈
- **WCAG 2.2 AA 목표** (확정)
  - 예외: CTA `pressed`의 `blue/100` 배경과 흰색 텍스트 조합은 디자이너가 Figma 원형 유지로 승인함 (2026-07-14, 대비 약 1.31:1)
  - **Figma 원본의 대비 미달은 여기에 목록으로 쌓지 않는다** (2026-08-13 방침 전환). 디자이너가 화면을 보고 정한 결과라 우리가 되묻는 항목이 아니고, 실측값은 Figma가 바뀌면 며칠 만에 낡는다. 코드는 원본을 그대로 두고, 대비 계산은 **우리 토큰 매핑이 틀렸는지 보는 신호**로만 쓴다 (`figma-bridge` §4-2 · `design-feedback` §선별 기준 2관문)
  - `TODO(✍️):` `badge/reporter-rank` 글자·심볼 색 불일치 — 심볼 SVG는 green/500·orange/400인데 v02까지의 글자는 green/700·orange/700이었다. v03 `content/rank` 토큰이 심볼 값과 일치해 글자를 거기 맞춘 상태다(대비가 내려간 건 색을 밝혀서가 아니라 정합시켜서다). 어느 쪽으로 통일할지 확인 대기 — `디자인_docs/feedback/0813-v2/디자인시스템-리뷰.md` 1번
- `TODO(✍️):` 핵심 비주얼·타겟 톤 → `design-guide.md`

## 6. 개발 환경
- pnpm(워크스페이스 없음), Vitest + Playwright(스크린샷 회귀 + axe), 프론트 전용 레포 + 외부 Spring(별도)
- 디자인 검증: `/playground` 갤러리 (스토리북 안 씀)
- `TODO(✍️):` 배포 타겟(Vercel 여부) / 분석 도구
