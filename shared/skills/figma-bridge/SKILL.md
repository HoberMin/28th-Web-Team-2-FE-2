---
name: figma-bridge
description: Figma MCP → 코드 변환 규율 + 디자이너가 Figma를 넘겼을 때의 실행 런북. **Figma 접근은 MCP 전용(REST·public API 금지)**, 분류 판단, MCP 실패 진단 순서, 토큰 매핑, 대비 검산, 폐기된 규격 처리, 프로젝트 구조 공통 정의, 배포 확인까지. figma-implementer/design-system-builder/code-reviewer/design-advisor가 참조.
---

# Figma Bridge

**상상코딩을 구조로 차단하는 게 목적.** "추측하지 마"가 아니라 "추측을 못 하게."

이 문서는 규율 + **실행 런북**이다. 디자이너가 Figma 링크를 던졌을 때 되묻지 않고 스스로 판단해 진행할 수 있어야 한다.

## 0-0. Figma 접근은 **MCP 도구로만** (하드 룰 — 위반은 🔴 Critical)

Figma 값을 가져오는 경로는 **MCP 도구 하나뿐이다.** 다음은 전부 금지:

| ❌ 금지 | 왜 |
|---|---|
| Figma REST / public API (`api.figma.com`) | 토큰을 레포·환경변수에 심게 되고, MCP가 주는 변수 바인딩·시맨틱 alias 정보가 없어 hex만 긁다 오독한다 |
| `curl`·`wget`·`WebFetch`로 **Figma** 호출 | 같은 이유. `.claude/settings.json`의 `deny`가 figma.com 대상만 막는다 — **일반 `curl`/`wget`은 정상 허용**(범용 도구라 전면 금지하지 않는다). 패턴 기반이라 우회가 원리적으로 가능하니, 막히지 않았다고 해서 허용된 게 아니다 |
| Figma 이미지·아이콘을 `curl`로 받기 | `download_assets` MCP 도구를 쓴다. 과거 세션에 `curl`로 asset을 받은 흔적이 있었고, 그게 바로 대체 대상이다 |
| personal access token·`FIGMA_TOKEN` 류 발급·저장 | 시크릿 규칙 위반(conventions #7). MCP는 OAuth라 토큰이 필요 없다 |
| 스크린샷만 보고 hex 옮기기 | 실측 8건 오독 (§2) |

**MCP가 안 되면 REST로 우회하지 말고 멈추고 사용자에게 알린다.** 우회는 값 오류로 이어지고, 그 오류는 토큰이라 전 화면에 퍼진다.

### MCP가 안 될 때 진단 순서 (이 순서 그대로)

1. **도구가 목록에 아예 없다** → agent 설정 문제다. `tools` 필드는 **allowlist**이므로 거기에 MCP가 없으면 그 agent는 Figma를 못 본다. 메인 세션에서는 잘 되는데 agent에서만 안 되는 증상이 이것이다 → `shared/agent-roles.md` §도구 부여 규약대로 `tools`를 생략(상속)한다
2. **`whoami`** 호출 — 인증된 계정·플랜·좌석이 나온다. 실패하면 **claude.ai Figma 커넥터 재인증**이 필요하다(사용자에게 안내, 레포에서 해결할 수 있는 일이 아니다)
3. **파일 접근 권한** — 열려는 파일이 `whoami`가 보여준 플랜에 속하는지. 남의 팀 파일이면 권한 오류가 난다
4. **레이트리밋** — 에러에 rate limit이 **명시될 때만** 의심한다. Dev/Full 좌석은 200회/일 이상이라 평소엔 걸리지 않는다. 단 **View/Collab 좌석 또는 Starter 플랜은 월 6회**이므로, 이 에러가 뜨면 좌석 승급이 답이고 우회로는 없다

### 디자이너에게 안내할 때 (이 3줄만)

1. **Figma 링크만 붙여넣으세요.** 노드를 선택한 상태의 링크면 더 정확합니다
2. **API 키·토큰은 필요 없습니다.** 그걸 요구하는 답이 오면 잘못된 경로입니다
3. 안 되면 이 말만 하세요 — **"Figma MCP 연결 확인해줘"**

## 0-1. 쓸 수 있는 MCP 도구 (용도별)

| 하려는 일 | 도구 |
|---|---|
| 정체 파악(이름·자식 구조) | `get_metadata` |
| 토큰 값(변수 바인딩) | `get_variable_defs` |
| 노드의 코드·텍스트 맥락 | `get_design_context` |
| 렌더 이미지 | `get_screenshot` |
| 파일에 붙은 라이브러리 목록 | `get_libraries` |
| 라이브러리 안에서 규격 검색 | `search_design_system` |
| 이미지·아이콘 내려받기 | `download_assets` |
| 코드↔컴포넌트 매핑 확인 | `get_code_connect_map` |
| **Figma 파일에 직접 쓰기**(레이어 리네임·순서 변경 등) | `use_figma` — 쓰기 도구. 호출 전 `/figma-use` 스킬(또는 `skill://figma/figma-use/SKILL.md`)을 반드시 먼저 읽는다. 현재 `figma-handoff-auditor`만 씀 — 다른 agent는 읽기 전용 |

`get_libraries` → `search_design_system` 조합은 "이 규격이 라이브러리에 실제로 있나"를 확인하는 가장 싼 방법이다 — **"Figma에 있는 규격만 만든다"** 규칙(design-guide §1-1)을 검증할 때 쓴다.

## 0. 진실 소스 (2026-08-05)

| 대상 | Figma | 코드 |
|---|---|---|
| 컬러 | node `126-1092` — Raw Color 58 · Semantic Color 24 | `app/globals.css` `@theme static` |
| 타이포 | node `171-3737` — title·body·caption 21종 | 같음 |
| 레디어스 | node `126-1092` — Radius 5 | 같음 |
| 컴포넌트 | **없음** (Design Library에 컴포넌트 규격 미존재) | `app/_components/` — 아직 만들 게 없어 디렉토리 없음 (§8) |

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

## 8. 프로젝트 구조 (agent 공통 — 여기가 진실 소스, agent 파일에 복붙하지 않는다)

이전엔 이 블록이 figma-implementer·design-system-builder·code-reviewer 세 곳에 복붙돼 있었다. 값이 바뀌면 세 곳이 어긋나므로 **여기 하나만 둔다.**

- **단일 루트 Next.js 프로젝트.** 모노레포·워크스페이스·`packages/`·`apps/` **없음**. 루트가 곧 Next 프로젝트다
- `app/`(App Router) · `app/api/*`(외부 Spring 앞단 BFF) · `app/prototype/*`(프로토타입 화면 — 실데이터 연동, **구조 유지 대상이니 삭제·대규모 개편 금지**) · `app/playground`(디자인 갤러리)
- **디자인 토큰은 `app/globals.css`의 `@theme static` 블록 한 곳** — 별도 `tokens.css`·패키지 없음. `static`은 미사용 토큰까지 항상 emit하려는 것(시맨틱 alias·SEED 오버라이드가 끊기지 않게) — **`@theme`으로 되돌리지 말 것**
- 정식 공통 컴포넌트 자리는 `app/_components/`, 유틸은 `app/_lib/`다. **아직 없다** — Figma에 컴포넌트 규격이 없어서(토큰만 있다) 만들 게 없는 것이고 이 상태가 정상이다. 규격이 올라오면 그때 생성한다. (프로토타입 전용 부품은 `app/prototype/_components/`에 이미 있고, 그건 정식 DS가 아니다)
- **barrel export 예외 없음** (conventions #2)
- 폰트: **Wanted Sans Variable 1종**(동적 서브셋 92분할 self-host — `public/fonts/wanted-sans/`, `@font-face`는 `app/fonts/wanted-sans-subset.css`). Pretendard·head1/head2 3종 체계는 폐기

### 디자이너가 올리는 것을 받는 방식 (UT 종료 · 상시 협업 단계)

Figma로 오는 항목은 프로토타입 참고물이 아니라 **실 서비스의 디자인 가이드**다. 디자이너가 코드에 직접 주입할 수도 있다.

**① 토큰** — 진실 소스는 Figma Variables, 반영 지점은 `@theme static` 한 곳. 매핑은 §3. 시맨틱은 raw를 `var()`로 참조(hex 복제 금지). 반영 후 검산 3종(§4)은 생략 불가.
**② 컴포넌트** — **Figma에 규격이 올라온 뒤에만** 만든다(없는 걸 상상하지 않는다). `app/_components/<이름>.tsx` + `app/playground/_stories/<이름>.tsx` + `registry.ts` 한 줄. 값은 `@theme` 토큰만, 시맨틱 슬롯이 있으면 raw 팔레트보다 시맨틱 우선. **SEED와 혼용 금지**(design-guide §1-2).

## MCP 인증·호출 실패

- **REST·public API로 우회하지 않는다** (§0-0). 진단 순서를 따르고, 그래도 안 되면 사용자에게. **임의 값 생성 금지**
- 모든 디자인 값은 "Figma 노드에서 가져옴" / "추정"으로 구분. 추정이면 게이트
