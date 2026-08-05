# 디자인 가이드 (단일 진실 소스 · 디자이너 소유)

> **디자이너가 소유·편집하는 문서.** 이 프로젝트에서 디자이너는 문서만이 아니라 **공통 컴포넌트(`app/_components/`)와 토큰(`app/globals.css` `@theme`) 코드도 소유**한다(바이브코딩 — design-system-builder agent).
> 채울 때마다 갱신 → 미정은 추측 금지, `TODO(✍️)`로.

## 0. 이 문서의 경계 (중요)

- **여기엔 토큰 *값*을 적지 않는다.** 색·간격·타이포 수치의 진실 소스는 **Figma Variables** → `app/globals.css`의 Tailwind v4 `@theme static` 블록으로 sync(figma-implementer 또는 디자이너 직접 주입). 문서에 hex를 복제하면 drift.
- **sync 결과 검산은 `/playground`의 Color·Typography·Radius 스토리에서 한다** — 스토리 라벨에 Figma 원본 hex·스펙이 적혀 있어 스와치와 어긋나면 sync가 틀린 것이다. (hex 오독이 2회 발생한 이력 때문에 만든 안전판)
- 디자이너의 토큰 역할 = Figma Variable 그룹 구조(`color/gray/100`)·스케일 일관성 **검증** + sync된 `@theme` 결과 확인.
- **여기엔 토큰이 아닌 디자인 룰**을 적는다: 원칙·보이스·컴포넌트 사용 규칙·do/don't.

## 1. 디자이너 워크플로우 (이 프로젝트의 신설 규약)

> **단계 전환 (2026-08-05, 확정)**: **UT 단계는 끝났다.** 지금부터 Figma로 전달되는 항목은 UT 프로토타입 참고물이 아니라 **실 서비스의 디자인 가이드**다. 디자이너와의 상시 협업 단계이고, 디자인 시스템(컴포넌트·`@theme` 토큰)은 **디자이너가 직접 코드에 주입할 수 있다.** 그래서 토큰이 별도 패키지·파일이 아니라 서비스의 `app/globals.css` 안에 있다 — 주입 지점이 하나여야 하기 때문.

1. Figma에서 컴포넌트·토큰 작업
2. **design-system-builder** 로 바이브코딩 → `app/_components/` 에 구현 (Radix/shadcn 기반 — a11y 기본 내장)
3. 컴포넌트마다 **`/playground` 스토리 추가** — §1-1 규약대로 (규격 1개=파일 1개, Figma 출처 명시, 흰 배경)
4. **빌드 1회(`pnpm build`) → 푸시 전 리뷰 1회 → 바로 main 푸시** (full git 권한). **여기서 끝.** 푸시하면 CI가 자동 배포하므로 결과는 **배포된 Vercel `/playground`에서 확인** — 로컬 `pnpm dev` 불필요.
5. Figma를 고치면 **재-sync는 자동이 아니다** — "고쳤어요"를 알리고 figma-implementer 재실행 (stale 방지 생명선)

> ⚡ **디자이너 플로우는 4단계에서 끝난다.** 테스트 코드 작성·E2E·스크린샷 회귀·플랜 문서 작성은 디자이너 작업 범위 밖 — 필요해지면 추후 test-writer가 일괄로 한다. 리뷰도 푸시 전 1회면 충분(code-reviewer가 토큰·a11y·Figma 정합 체크를 겸한다 — 구 design-reviewer는 여기에 흡수됐다).

> ⚠️ **레포에 남기는 산출물은 컴포넌트 코드 + `/playground` 스토리뿐이다** (conventions #12). 플랜·설계 MD·독립 미리보기 HTML 같은 작업 보조 파일을 커밋하지 않는다 — superpowers 등 개인 플러그인이 이런 파일을 만들려 하면 그 파이프라인 대신 위 워크플로우(design-system-builder)를 쓴다. 결과 확인은 배포된 `/playground`에서.

## 1-1. 플레이그라운드 스토리 규약 (필수)

`app/playground` = 디자이너가 결과를 확인하는 갤러리. 스토리북 대신 쓰는 우리 규격:

- **Figma에 있는 규격만 등록한다.** Figma에 없는 임의 시드·shadcn 기본 컴포넌트 금지. 모든 스토리는 `figma` 필드(node id)로 출처를 명시.
- **규격 1개 = 스토리 파일 1개** — `_stories/<규격이름>.tsx`에 만들고 `_stories/registry.ts`에 한 줄 등록. **디자이너가 커밋 하나 = 파일 하나**로 자기 작업을 알아볼 수 있게 분리 유지(여러 규격을 한 파일에 합치지 않는다).
- **`group` 지정 필수** — `파운데이션`(타이포·컬러·간격 등 토큰류) / `컴포넌트`(버튼·입력 등 UI 부품) / `패턴`(조합 규칙). 목차와 본문이 이 그룹으로 묶여 정렬된다. 새 그룹이 필요하면 `_stories/types.ts`의 `StoryGroup`에 추가.
- **배경은 흰색 고정** — 페이지가 `bg-white`로 강제한다. 다크모드·전역 테마가 대조 기준을 흔들면 안 됨. 스토리 안에서 배경색을 바꾸지 말 것(어두운 배경 검증이 필요한 규격은 스토리 내부에 명시적 대비 블록으로).
- **좌측 목차** — registry에 등록하면 자동으로 좌측(모바일은 상단) 목차에 잡힌다.
- 스토리 내용 = 그 규격의 **모든 variant·state 나열** (타이포는 전 스케일, 컴포넌트는 variant × hover/disabled/loading 등).

> **현재 인벤토리 (2026-08-05)**: `Color`·`Typography`·`Radius` **3종뿐이다.** Figma Design Library에 있는 규격이 토큰 3개 컬렉션뿐이라 이게 전부가 맞다.
> 이전에 있던 컴포넌트 스토리 7종(CTA·CTA Small·CTA Insta·Text Field·Text Field Set·Survey Button·Indicator Bar)은 **삭제했다** — 전신 프로젝트(Looky) Figma 파일에서 온 규격이고 현 라이브러리에 원본이 없어 위 "Figma에 있는 규격만 등록" 규칙 위반이었다. 딸린 구현(`app/_components/*`)과 유틸(`app/_lib/cn.ts`), 의존성(`class-variance-authority`·`clsx`·`tailwind-merge`)도 함께 걷어냈다.
> **컴포넌트가 없는 상태는 정상이다.** Figma에 규격이 올라오는 대로 하나씩 추가한다.

## 1-2. 외부 디자인 시스템 — Seed Design (프로토타입 탐색용, 2026-07-23 도입)

당근의 디자인 시스템 **Seed Design**을 UT 프로토타입 실험용으로 도입했다(스킬 설치만 완료, 화면 구현은 별도 세션 예정).

- **위치**: `npx skills add daangn/seed-design`로 설치 → `.agents/skills/seed-design/`(스킬 문서), `.claude/skills/seed-design`(심링크), `skills-lock.json`(버전 고정). 어댑터 구조는 `CLAUDE.md §어댑터·동기화` 참조. 직접 편집 금지 — `npx skills update`로만 갱신.
- **용도 한정**: **UT 프로토타입/실험 참고용**이다. 격리 라우트에서만 쓰고, 정식 디자인 시스템(`app/_components/` · `@theme` 토큰)과 **혼용하지 않는다**.
- **우선순위 (SSOT 충돌 방지)**: 이 프로젝트의 디자인 진실 소스는 **여전히 Figma Variables → `@theme`**. Seed Design은 *참고*일 뿐이며, `/playground` 스토리 규약(§1-1 "Figma에 있는 규격만")·토큰 화이트리스트와 충돌하면 **항상 Figma가 우선**한다. Seed 컴포넌트를 정식 DS로 승격하려면 별도 논의·리뷰 게이트가 필요하다.
- **실 사용 참고**: 셋업·컴포넌트·토큰은 `seed-design` 스킬이 안내(`@seed-design/react`+`@seed-design/css`, `seed-design.json`). 문서: `https://seed-design.io`.
- `TODO(✍️):` UT 시나리오 화면 구현 — 어떤 플로우/화면을 만들지 미정(다음 세션). 격리 라우트 예정.

## 2. 디자인 원칙

- 확정: **모바일 퍼스트**, **WCAG 2.2 AA**, 상태 3종(로딩/에러/빈) 필수
- `TODO(✍️):` 핵심 디자인 원칙 3~5개 / 핵심 비주얼 / 타겟 톤

## 3. UI 보이스 & 톤 (카피 가이드)

- `TODO(✍️):` 호칭(반말/존댓말), 에러·빈 화면 카피 톤

## 4. 컴포넌트 사용 규칙

- 같은 컴포넌트의 화면별 변형은 **variant로 명시**(임의 변형 금지) — `design-handoff` 참조
- 새 공통 컴포넌트는 **Radix primitive가 있으면 그 위에** 만든다 (키보드·ARIA·포커스 공짜)
- `TODO(✍️):` 버튼 위계(주 CTA/보조) 등 컴포넌트별 규칙

## 5. 접근성·디바이스

- **WCAG 2.2 AA 목표** — axe가 Playwright·`/playground`에서 자동 검사
- `TODO(✍️):` 최소 터치 영역·대비·글씨 크기 기준 (`accessibility` 스킬 참조)
