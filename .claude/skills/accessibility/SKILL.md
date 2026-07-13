---
name: accessibility
description: 웹 접근성(a11y) best practice — 시맨틱·키보드·ARIA·모바일 터치. ★사용자 직접 검토 대상 초안. frontend-dev/figma-implementer/code-reviewer가 참조.
---

# 웹 접근성 (a11y)

> WCAG 기준. **★ 직접 검토·보강 권장 초안.** 모바일 위주라 터치·반응형 우선.

## 핵심 (POUR)
- **시맨틱 HTML 우선** — `button`/`a`/`nav`/`main`/`header`/heading 위계. div 버튼 지양
- **키보드 접근** — 모든 인터랙티브 요소 Tab 이동·Enter/Space 동작, 포커스 표시(focus-visible), 포커스 트랩(모달)
- **이미지 alt**, 장식 이미지는 빈 alt
- **폼**: label-input 연결, 에러를 텍스트+aria로 안내 (form-patterns 연계)
- **색 대비**: 본문 4.5:1 이상. 색에만 의존하지 않기
- **ARIA는 시맨틱으로 안 될 때만** — role/aria-* 보충 (남용 금지)
- 동적 변경은 `aria-live`로 안내

## 모바일 터치
- **터치 타겟 최소 44×44px** 권장
- 호버 전용 인터랙션 금지(터치 대체 제공)
- 확대(viewport zoom) 막지 않기, 폰트 스케일 대응

## 검토 도구
- `TODO(✍️):` 타겟 사용자(연령·보조기술) 확정 후 기준 강화
- axe / Lighthouse a11y 점검을 리뷰에 연계
