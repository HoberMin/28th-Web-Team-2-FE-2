# web-2-fe-2 — Claude Code 지침

> 공유 규격은 `shared/` 가 진실 소스. 이 파일은 그것을 참조 + Claude 전용 오케스트레이션.
> 전신(28th-Web-Team-2-FE) 하네스에서 이식 — **CSR→RSC+BFF 전환, 디자이너 바이브코딩 도입**이 핵심 변경.

## 공유 규격 (필독)

@shared/conventions.md
@shared/review-standard.md
@shared/git-flow.md
@shared/domain.md
@shared/product-spec.md
@shared/design-guide.md

## IMPORTANT (override)

- 위 `conventions.md` 최상위 규칙을 모든 작업에서 준수.
- **모르면 추측 말고 질문. 미정(TODO) 영역 건드리면 진행 전 묻고 `domain.md`에 기록.**
- 위험 경로 변경·배포 직전 = 사용자 확인 게이트. (커밋·푸시는 `git-flow.md` — main 직접 푸시 허용, 단 **푸시 전 리뷰 1회**)

## 페르소나 (라우팅보다 먼저 — 힌트이지 차단이 아님)

**두 페르소나 모두 코드를 짜고, 모두 full git(commit·push)이다.** 페르소나는 "무엇을 막을까"가 아니라 "어떤 agent·스킬을 먼저 꺼낼까"를 정하는 **맥락 힌트**.

| | 🎨 디자인 빌더 | ⚙️ 프론트 개발자 |
|---|---|---|
| 주 영역 | `packages/design-system` (토큰·공통 컴포넌트) + 화면 UI | `apps/web` 앱 로직·RSC·BFF·데이터·성능 |
| 기본 posture | Figma MCP 토큰 → 코드, 시각 정합, a11y, `/playground` 검증 | 아키텍처, Server/Client 경계, 캐싱, 타입 안정성 |
| 코드 범위 | 제한 없음 (RSC/BFF 수정 가능 — 프론트가 co-review) | 전 영역 |
| 우선 agent | design-system-builder · figma-implementer · wireframe-builder · design-reviewer | frontend-dev · api-developer · bug-investigator · code-reviewer |

- **신호로 분류**: Figma·토큰·컴포넌트 시각·플로우 언급 → 디자인 빌더 / 데이터·BFF·성능·버그·타입 언급 → 프론트 개발자. **애매하면 한 줄로 확인.**
- read-only 자문 agent(design-handoff-advisor·design-context-advisor)는 **선택 도구로 존치** — 질문형 요청이면 여전히 이쪽이 가볍고 빠르다.
- **디자이너도 코드 agent를 자유롭게 호출한다.** (전신의 "디자이너 맥락 코드 agent 자제" 규칙은 이 프로젝트에서 폐기)
- **agent 커스텀 개방**: 디자이너 포함 누구나 `.claude/agents/*.md`를 추가·수정할 수 있다. 단 역할 진실 소스인 `shared/agent-roles.md`를 같이 갱신할 것.

## 라우팅 (크기 × 위험)

```
            위험 낮음            위험 높음
크기 작음   S 바로 진행         게이트 + 리뷰 강제
크기 큼     M 탐색→구현→리뷰    L 기획+게이트 풀절차
```

- 크기: 파일 1-2=작음 / 3-5=중간 / 5+·새기능=큼
- 위험 경로(`TODO(✍️):` 인증·결제 등) 건드리면 크기 무관 한 단계↑ + 게이트
- "바로/빨리"→내림 / "제대로/꼼꼼히"→올림. 단 위험 경로는 못 내림.
- **RSC/BFF 경계를 바꾸는 작업**(server↔client 전환, Route Handler 추가·삭제, 캐싱 전략 변경)은 위험과 무관하게 **리뷰 1회 강제** — main 직접 푸시 체제의 안전판.

## agent 신호 → 라우팅 테이블

페르소나가 게이트를 안 하므로, **이 테이블이 실질 라우터다.**

| 신호 | agent |
|---|---|
| "어디 있어?", "어떻게 돼있어?" | explorer |
| "전부/하나도 빠짐없이 찾아줘" | auditor |
| "왜 필요해?", "어떻게 설계?", "계획 짜줘" | planner |
| 플로우 검수·CRUD 누락 | flow-reviewer |
| "에러 나", "버그", "왜 안 돼?" | bug-investigator (수정 X) → 구현 agent |
| BFF Route Handler·외부 Spring 연동·캐싱 전략 | api-developer |
| 페이지·화면·인터랙션 구현 | frontend-dev |
| **디자인 시스템 컴포넌트·토큰 (바이브코딩)** | **design-system-builder** |
| Figma 노드 → 코드 변환·토큰 sync | figma-implementer |
| 디자인 확정 전 초안·프로토타입 | wireframe-builder |
| "리뷰해줘" (코드) | code-reviewer |
| 디자인 정합·토큰 위반·a11y 검토 | design-reviewer |
| 테스트 작성·수정 | test-writer |
| 커밋 정리·푸시 | diff-organizer |
| 디자이너 질문 (핸드오프/제품 맥락) | design-handoff-advisor / design-context-advisor |

- 모델 티어(판단 밀도): **높음=fable / 중간=sonnet / 낮음=haiku** — `shared/agent-roles.md`가 진실 소스.

## 전용 플로우

- **디자인 시스템 컴포넌트**(디자이너 바이브코딩): design-system-builder(Radix/shadcn 기반) → `/playground` 스토리 추가 → design-reviewer(시각·토큰·a11y) → 푸시 전 code-reviewer 1회
- **와이어프레임 초안**(디자인 전): 유저 플로우 → flow-reviewer → [⏸] → wireframe-builder(더미 데이터·저충실도) → 배포(⏸) → 피드백. ※ 토큰 검사 면제, design-reviewer 미적용
- **신규 화면**(디자인 확정 후): Figma 확정(⏸) → figma-implementer → design-reviewer + code-reviewer
- **Bug**: bug-investigator(수정X) → 구현 agent → code-reviewer
- **전수검색**: auditor → 구현(일괄) → code-reviewer
- 리뷰는 "리뷰해줘" 자연어로 트리거 (슬래시 커맨드 안 씀)

## 미정 (TODO)

- `TODO(✍️):` 도메인·제품 스펙 전체 (`domain.md`·`product-spec.md` 스켈레톤 상태 — 서비스 확정 시 채움)
- `TODO(✍️):` 위험 경로 목록 (인증·결제 등 — 백엔드 스펙 나오면)
- `TODO(✍️):` PPR(Partial Prerendering) 도입 — Next에서 stable 승격 시 재검토 (지금은 안 씀)
