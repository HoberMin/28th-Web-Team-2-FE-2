---
name: figma-bridge
description: Figma MCP → 코드 변환 규율 + 디자이너가 Figma를 넘겼을 때의 실행 런북. 분류 판단, MCP 호출 순서와 실패 분기, 토큰 매핑, 대비 검산, 폐기된 규격 처리, 배포 확인까지. figma-implementer/design-system-builder/design-reviewer/code-reviewer가 참조.
---

# Figma Bridge

**상상코딩을 구조로 차단하는 게 목적.** "추측하지 마"가 아니라 "추측을 못 하게."

이 문서는 규율 + **실행 런북**이다. 디자이너가 Figma 링크를 던졌을 때 되묻지 않고 스스로 판단해 진행할 수 있어야 한다.

## 0. 진실 소스 (2026-08-05)

| 대상 | Figma | 코드 |
|---|---|---|
| 컬러 | node `126-1092` — Raw Color 58 · Semantic Color 24 | `app/globals.css` `@theme static` |
| 타이포 | node `171-3737` — title·body·caption 21종 | 같음 |
| 레디어스 | node `126-1092` — Radius 5 | 같음 |
| 컴포넌트 | **없음** (Design Library에 컴포넌트 규격 미존재) | `app/_components/` — 현재 디렉토리 자체 없음 |

fileKey: `WfW1Nkx1oiOWBHNwrw48IL` (Design Library). 페이지는 `(공유) 스타일가이드` 하나뿐이다.
**전신 프로젝트 파일 `TRXXVUvIwh8vh7FbBusXCO`(Looky-Design)는 진실 소스가 아니다** — 이 fileKey를 가리키는 규격을 새로 등록하지 말고, 발견하면 flag한다.

## 1. 링크만 받았을 때 — 무엇인지 먼저 분류한다 (되묻지 않는다)

`?node-id=` 가 있으면 그 노드부터, 없으면 `get_metadata`(nodeId 생략)로 페이지 목록을 받아 좁힌다.

1. `get_metadata`로 노드 이름·자식 구조를 본다 (값이 아니라 **정체**를 먼저 판단)
2. 이름으로 분류:
   - `Variables Documentation` / `Collection ...` → **토큰 sync**
   - `Text` / 스타일 이름이 `title/…`·`body/…` 형태 → **타이포 sync**
   - 컴포넌트·프레임 이름이 화면(`F01`, `홈`, `가게 상세` 등) → **화면 구현** (frontend-dev와 협업)
   - 버튼·입력 등 부품 → **컴포넌트 구현**
   - `font 다운로드` 같은 안내 프레임 → 폰트 교체 (§6)
3. 분류 결과를 한 줄로 말하고 바로 진행한다. **분류가 정말 안 되는 경우에만** 게이트.

## 2. 토큰을 읽는 실제 절차 (MCP 호출 순서)

**⚠️ `get_variable_defs`가 항상 되지는 않는다.** 이번 프로젝트의 실측:

| 노드 | `get_variable_defs` | 대응 |
|---|---|---|
| 타이포 프레임 (`171-3737`) | ✅ family·size·weight·lineHeight·letterSpacing 전부 반환 | 그대로 사용 |
| Variables Documentation (`126-1092`) | ❌ **빈 객체 `{}`** — 문서 프레임에 변수가 바인딩돼 있지 않다 | 아래 폴백 |

**빈 객체를 받으면 게이트로 멈추지 말고 폴백한다:**
1. `get_design_context`를 **행(Row) 단위**로 호출하면 변수명·hex가 텍스트로 온다. 정확하지만 행당 ~3k 토큰이라 전체(86행)엔 부적합 → 소수 확인용
2. 대량이면 `get_screenshot`을 **컬렉션 프레임 단위**로, `maxDimension`을 원본 크기 이상으로 줘서 네이티브 해상도로 받고 **2배 업스케일 후 분할**해서 읽는다
3. **읽은 값은 반드시 교차 검증한다** — Semantic Color 표에 같은 raw가 다시 등장하므로(예: `content/disabled → gray/400`, `trend/flat → gray/400`) raw 표와 시맨틱 표를 대조해 확인한다

### 스크린샷 판독 금지 규칙
**저해상도 스크린샷으로 hex를 옮기지 말 것.** 2026-08-04 sync가 이 방식이었고 **8건이 틀렸다**:
`b↔8`, `4↔a`, 뒤 두 자리 전치 — `gray/400 B4BBCB→b4b8cb`, `blue/200 BBE1FF→8be1ff`, `green/400 34D38B→34d3b8` 등.
네이티브 해상도 + 업스케일 + 교차 검증 3개를 다 하지 않았다면 값을 커밋하지 않는다.

## 3. 매핑 규칙 (확정)

```
color/gray/100        → --color-gray-100        → bg-gray-100 / text-gray-100
color/common/black50  → --color-black-50        (alpha는 color-mix로 재현)
Semantic/content/primary → --color-content-primary: var(--color-gray-900)   ← alias는 var()로, hex 복제 금지
title/24-bold         → --text-title-24-bold (+ --line-height/--letter-spacing/--font-weight)
radius/lg             → --radius-lg            → rounded-lg
```
- letterSpacing: Figma `%` → `em` (`-2%` → `-0.02em`)
- lineHeight: Figma 배수를 단위 없이 그대로
- **`@theme static`을 유지한다.** Tailwind는 미사용 토큰을 산출물에서 지우는데, 시맨틱 alias와 SEED 오버라이드가 `var(--color-*)`를 참조하므로 pruning되면 끊긴다. `@theme`으로 되돌리지 말 것
- **매핑 안 되는 변수 → 추측 금지, 실패 처리**

## 4. 반영 후 필수 3종 (하나도 생략 불가)

1. **`/playground` 스토리 라벨 갱신** — Color·Typography·Radius 스토리가 Figma 원본 값을 라벨로 들고 있어 검산면 역할을 한다. **값만 바꾸고 라벨을 두면 검산이 죽는다.** 새 토큰을 추가하면 스토리에도 행을 추가한다
2. **대비 검산** — 토큰을 바꾸면 대비가 바뀐다. 실측 사례:
   - `orange-600 #ff6f00` 흰 배경 **2.79:1** → 12px 텍스트 AA(4.5:1)·아이콘(3:1) 둘 다 미달
   - `trend-flat gray-400` **2.0:1** → 텍스트로 쓰면 미달 (아이콘용 값)
   텍스트에 쓰는 색은 4.5:1, 아이콘·경계선은 3:1을 계산해서 확인하고, 미달이면 **한 단계 어두운 토큰을 쓰거나 flag**한다. Figma가 미달 값을 준 경우 "Figma 원본 유지 + 미달 사실 보고"로 처리하고 임의로 색을 바꾸지 않는다
3. **`pnpm build` 1회 + 산출물 확인** — 컴파일된 CSS에서 새 토큰이 실제로 emit됐는지 grep한다(`--color-…`·`.text-…{`). 빌드 성공만으로는 토큰이 살아 있는지 알 수 없다

## 5. Figma에서 규격이 사라졌을 때 (폐기 처리)

Figma가 스케일·컴포넌트를 지우면 코드에 남은 사용처를 옮겨야 한다. 실측 사례(타이포 21종 교체 시 head1/head2/26/body-18 폐기, 40곳 이관):
- **크기 우선 유지 → 없으면 한 단계 내림** (`head1-26` → `title-24-medium`, `body-18-regular` → `body-16-regular`)
- **weight는 Figma가 제공하는 최근접값** (`head1`은 400이었지만 title 최저가 medium 500)
- 대응 계열이 아예 없으면 다른 계열로 (`head2-16` → title에 16이 없어 `body-16-bold`)
- **이관 표를 커밋 메시지에 남긴다** — 나중에 되짚을 수 있어야 한다
- 사용처가 0이 된 구 토큰은 삭제한다. 딸린 유틸·의존성도 함께 정리(사용처를 grep으로 확인 후)

## 6. 폰트가 바뀔 때

현재: **Wanted Sans Variable**, 동적 서브셋 92분할 self-host.
- 파일: `public/fonts/wanted-sans/*.woff2` (92) + `OFL.txt`, `@font-face`는 `app/fonts/wanted-sans-subset.css`
- 갱신: GitHub 릴리즈(`wanteddev/wanted-sans`)의 `webfonts/variable/split`에서 `.css` + `woff2` 92개를 받아 CSS의 `url("./woff2/…")` → `url("/fonts/wanted-sans/…")`로 치환. OFL도 함께 교체
- **`next/font/local`을 쓰지 않는다** — unicode-range 92분할은 단일 파일 모델에 맞지 않다. `--font-sans`가 스택을 들고 있고 `<html>`의 `font-sans`가 적용한다
- CDN(jsDelivr) 대신 self-host인 이유: 바이트 이득은 같고 외부 의존·preconnect 왕복이 없다

## 7. 결과 확인 — "배포된 화면"만 보라고 안내하면 안 된다

푸시 → CI(`sync-fork`) → fork → Vercel 자동 배포다. **배포가 실패하면 Vercel은 직전 성공 배포를 그대로 서비스한다** — 화면이 안 바뀌면 "반영 안 됨"이 아니라 "배포 실패"일 수 있다. 2026-08-05에 실제로 발생(`Root Directory "apps/web" does not exist`).

디자이너에게 안내할 때는 **새 빌드인지 판별할 근거를 함께 준다**:
- 이번 변경으로 화면에 생기는 눈에 보이는 차이 1개를 미리 알려준다 (예: "좌측 제목이 '디자인 시스템 · 규격 3개'로 바뀌면 새 빌드")
- 안 바뀌면 Vercel Deployments에서 최신 배포가 **Error**인지 확인하라고 안내
- 로컬 `pnpm dev` 안내는 하지 않는다

## MCP 인증·호출 실패

- 인증 실패 시 fallback 절차 → 그래도 안 되면 사용자에게. **임의 값 생성 금지**
- 모든 디자인 값은 "Figma 노드에서 가져옴" / "추정"으로 구분. 추정이면 게이트
