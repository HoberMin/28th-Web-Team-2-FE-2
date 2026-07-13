---
name: frontend-design
description: 디자인 구현 가이드. 모바일 퍼스트, 토큰 화이트리스트, 브레이크포인트, 3종 상태. 디자인 시스템 진실 소스는 Figma/디자이너 가이드. frontend-dev/figma-implementer/리뷰어가 참조.
---

# 디자인 구현 가이드

**디자인 시스템 진실 소스 = Figma + 디자이너 가이드.** 임의 디자인 결정 금지.

## 규칙
- **모바일 퍼스트**: 무프리픽스 = 모바일(sm 기준), `md:` 부터 데스크탑. 예: `p-4 md:p-6`
- **토큰 화이트리스트**: Tailwind config 안의 토큰만. config 밖 raw 값·arbitrary value(`[13px]`, raw hex) 금지 (figma-bridge 참조)
- **3종 상태**: 로딩 / 에러 / 빈 상태를 항상 처리
- 토큰은 Figma Variables → config 자동 생성

## TODO
- `TODO(✍️):` 컴포넌트 라이브러리 (shadcn? 디자인 시스템 보고)
- `TODO(✍️):` 타겟 사용자 (연령·디바이스·접근성·글씨 크기)
- `TODO(✍️):` PWA 웹/앱 디자인 분리 전략
