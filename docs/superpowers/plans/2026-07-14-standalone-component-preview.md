# Standalone Component Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개발 서버 없이 더블클릭으로 7종 컴포넌트와 모든 Figma 상태를 볼 수 있는 독립 HTML 파일을 만든다.

**Architecture:** 저장소 루트의 단일 HTML에 스타일, SVG, 마크업을 모두 인라인으로 넣는다. React 코드를 실행하지 않는 검수 보조물이며, 현재 디자인 시스템 컴포넌트의 토큰과 치수를 정적으로 복제한다.

**Tech Stack:** HTML5, 인라인 CSS, 인라인 SVG

## Global Constraints

- 외부 스크립트, 패키지, 이미지, 폰트, 네트워크 요청을 사용하지 않는다.
- `file://` 환경에서 동작해야 한다.
- 일반 컴포넌트 폭은 350px, 공유 CTA 폭은 171px이다.
- 실제 React 렌더링이 아닌 디자인 확인용 복제 화면임을 상단에 표시한다.
- 기존 React 컴포넌트와 사용자 `.codex` 변경은 수정하지 않는다.

---

### Task 1: 독립 컴포넌트 미리보기

**Files:**
- Create: `figma-components-preview.html`

**Interfaces:**
- Consumes: `packages/design-system/src/components/*.tsx`, `packages/design-system/src/tokens.css`, 승인된 독립 미리보기 설계
- Produces: 브라우저에서 직접 열 수 있는 `figma-components-preview.html`

- [x] **Step 1: 결과물이 아직 없는지 실패 확인**

Run: `test -f figma-components-preview.html`

Expected: exit code 1 because the preview has not been created.

- [x] **Step 2: 단일 HTML 구현**

`figma-components-preview.html`에 다음 구조를 완성한다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Looky 컴포넌트 미리보기</title>
    <style>
      /* 현재 tokens.css의 9개 색상과 컴포넌트 치수를 인라인 정의 */
      /* 반응형 카드 그리드, 350px/171px 검수 폭, 상태별 스타일 정의 */
    </style>
  </head>
  <body>
    <main>
      <header>디자인 확인용 미리보기 안내</header>
      <section>CTA: default, disabled, pressed</section>
      <section>CTA Small: stroke, stroke_icn, fill</section>
      <section>CTA Insta</section>
      <section>Text Field: focused, entered, placeholder, error</section>
      <section>Text Field Set: default, description</section>
      <section>Survey Button: default, activated</section>
      <section>Indicator Bar: step1, step2, step3</section>
    </main>
  </body>
</html>
```

각 section은 실제 텍스트, 상태명, 현재 SVG path와 확정된 색·높이·radius를 포함해야 한다. 시각 전용 컨트롤은 클릭 동작을 추가하지 않는다.

- [x] **Step 3: 파일 구조와 상태 누락 검사**

Run: `xmllint --noout figma-components-preview.html`

Expected: HTML parser error 없음.

Run: `rg -o 'data-component="[^"]+"' figma-components-preview.html | wc -l`

Expected: `7`

Run: `rg -o 'data-state="[^"]+"' figma-components-preview.html | wc -l`

Expected: `18`

Run: `rg -n 'https?://|<script|TODO|TBD' figma-components-preview.html`

Expected: no matches and exit code 1.

- [x] **Step 4: 변경 범위 검사**

Run: `git diff --check -- figma-components-preview.html`

Expected: no output and exit code 0.

- [x] **Step 5: 결과물 커밋**

```bash
git add figma-components-preview.html docs/superpowers/plans/2026-07-14-standalone-component-preview.md
git commit -m "docs(preview): 컴포넌트 독립 미리보기 추가"
```
