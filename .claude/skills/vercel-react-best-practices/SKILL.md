---
name: vercel-react-best-practices
description: React/Next.js 성능 최적화 가이드. 컴포넌트·데이터 페칭·번들·렌더링 작성/리뷰/리팩토링 시 참조. frontend-dev/figma-implementer/code-reviewer가 참조.
---

# React / Next.js 성능 베스트 프랙티스

검증된 룰셋 (Vercel Engineering 기반). 핵심 카테고리:

- **렌더링**: 불필요한 리렌더 방지(memo·derived state·functional setState), 조건부 렌더, JSX hoist
- **번들**: 동적 import, barrel import 회피, 서드파티 defer
- **데이터 페칭**: 병렬화, Suspense 경계, await defer
- **JS**: early exit, Set/Map 조회, 캐시·정규식 hoist

## TODO
- `TODO(✍️):` 전체 rules/ 룰셋을 anjihyang `vercel-react-best-practices/rules/`에서 가져와 채우기 (1파일=1규칙)
- Next.js 렌더링 전략(SSR/SC/BFF) 확정 후 Server/Client 관련 규칙 보강
