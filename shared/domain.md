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
- `TODO(✍️):` 인증·식별
- `TODO(✍️):` 유저 플로우
- `TODO(✍️):` 핵심 엔티티·상태머신

## 3. 아키텍처 제약 (확정분)
- **단일 루트 Next.js 프로젝트** (2026-08-05 모노레포 해체): 루트 `app/`(App Router). 디자인 시스템은 서비스에 병합 — `app/_components/`(공통 컴포넌트) + `app/globals.css` `@theme`(토큰)
- **풀 RSC + BFF** — Server Component 기본, `app/api/*` Route Handler가 외부 Spring 앞단. 상세 → `conventions.md`
- 외부 백엔드: **Spring (별도 레포)** — `TODO(✍️):` API 스펙
- 캐싱 적극 활용 (revalidate/tags 명시 의무) → `data-fetching` 스킬

## 4. 코딩 컨벤션
→ `conventions.md`. 도메인 특화 규칙은 생기면 여기에.

## 5. UI 원칙
- **모바일 퍼스트** (확정)
- **타이포·폰트**: Wanted Sans 1종 + Figma `title`/`body`/`caption` 21종 (node 171-3737 최종본, 2026-08-05). 구 Pretendard·head1/head2 체계 폐기
- **상태 3종 필수**: 로딩 / 에러 / 빈
- **WCAG 2.2 AA 목표** (확정)
  - 예외: CTA `pressed`의 `blue/100` 배경과 흰색 텍스트 조합은 디자이너가 Figma 원형 유지로 승인함 (2026-07-14, 대비 약 1.31:1)
  - `TODO(✍️):` 대비 미달 — 디자이너 확인 필요 (Figma 원본 값을 그대로 두고 코드로 옮긴 상태, 승인 아님. 2026-08-06/07 sync에서 실측):
    - Button(node 160-2855) primary normal 2.43:1 · pressed 3.18:1 · tertiary normal 4.33:1 (본문 기준 4.5:1)
    - Button outlined 테두리 1.23:1 (UI 컴포넌트 기준 3:1)
    - TextField(node 237-8556) placeholder 안내 문구 1.74:1 (기준 4.5:1)
    - Vegetable Price(node 224-7408) 단위 표기 1.92:1 (기준 4.5:1)
    - Vegetable Trend(node 224-7405) 텍스트 3.95:1 (기준 4.5:1) — 상승/하락 방향을 색(`trend/down`)에만 의존해 표시 중이라 WCAG 1.4.1 위반이기도 함. 방향 아이콘이 아직 없어서(Figma 미확정) 색 외 구분 수단이 없음
    - Semantic Color `content/accent/badge`(orange/700, v02 신설 → v03에서 리네임) 흰 배경 4.45:1 (기준 4.5:1) — 배지 텍스트에 적용 중
    - Semantic Color `content/error`(red/500, v03 신설) 흰 배경 3.61:1 (기준 4.5:1) — 온보딩 에러 문구에 적용 중(기존 raw `red-500`과 값 동일, 토큰화만 한 것이라 대비는 그대로다)
    - Semantic Color `content/rank/*`(v03 신설, `badge/reporter-rank`에 적용 완료) 등급명 텍스트 대비: king(orange/400) 2.02:1 · expert(green/500) 2.56:1 · sprout(gray/400) 1.92:1 · rookie(gray/600) 4.79:1 ✅. 이전 구현은 등급명 글자를 범용 토큰으로 근사해 expert 5.53:1 · king 4.45:1이었으나, **같은 배지 안의 심볼 SVG는 이미 green/500·orange/400**이어서 글자와 심볼 색이 어긋나 있었다. v03 전용 토큰이 심볼 값과 일치해 글자를 거기 맞추면서 대비가 내려갔다 — 색을 밝힌 게 아니라 정합시킨 것이다. 글자·심볼을 어느 쪽으로 통일할지는 확인 대기 (`디자인_docs/feedback/0813-v2/디자인시스템-리뷰.md` 2번)
- `TODO(✍️):` 핵심 비주얼·타겟 톤 → `design-guide.md`

## 6. 개발 환경
- pnpm(워크스페이스 없음), Vitest + Playwright(스크린샷 회귀 + axe), 프론트 전용 레포 + 외부 Spring(별도)
- 디자인 검증: `/playground` 갤러리 (스토리북 안 씀)
- `TODO(✍️):` 배포 타겟(Vercel 여부) / 분석 도구
