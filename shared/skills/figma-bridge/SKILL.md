---
name: figma-bridge
description: Figma MCP → 코드 변환 규율. 토큰 자동 생성·화이트리스트, MCP 실패 시 게이트, 상상코딩 차단. figma-implementer/design-reviewer가 참조.
---

# Figma Bridge

**상상코딩을 구조로 차단하는 게 목적.** "추측하지 마"가 아니라 "추측을 못 하게."

## 토큰 자동화
- Figma Variables → Tailwind config(`@theme`) **자동 생성**. 수동 입력 X.
- 변수명 → 코드 토큰명 매핑 규칙: `TODO(✍️):` 예) `color/brand/500` → `brand-500`
- **매핑 안 되는 변수 → 추측 금지, 실패(에러) 처리.**

## 구현 규율
- **토큰 화이트리스트 안의 값만** 사용. config 밖 raw 값·arbitrary value(`[13px]`, raw hex) 금지.
- **MCP가 노드/값을 못 가져오면 → 구현 진행 금지, 멈추고 사용자에게 스펙/값 요청(게이트).**
- 모든 디자인 값은 "Figma 노드에서 가져옴" 또는 "추정"으로 구분, 추정이면 게이트.

## MCP fallback
- 인증 실패·노드 누락 시: 사용자에게 스크린샷/값 요청, 또는 토큰 캐시 파일 참조. 임의 값 생성 금지.
