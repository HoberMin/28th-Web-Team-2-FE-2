---
name: vitest
description: Vitest 유닛 테스트 best practice. 구조, 모킹(vi), 커버리지, 환경. test-writer가 참조.
---

# Vitest Best Practice

유닛/통합 테스트 — 로직·유틸·훅 대상. (E2E는 Playwright)

## 구조
- 테스트는 대상 옆 `*.test.ts` 또는 `__tests__/`
- `describe`/`it` + 명확한 한국어 설명 ("~하면 ~한다")
- AAA: Arrange → Act → Assert

## 핵심
- **요구사항(스펙)을 검증** — 구현을 그대로 베낀 동어반복 테스트 금지 (test-strategy)
- 모킹은 `vi.mock` / `vi.fn` / `vi.spyOn` — 과한 모킹 지양 (진짜 동작 검증)
- 비동기는 `await` + `expect().resolves/rejects`
- 타이머·날짜는 `vi.useFakeTimers`
- React 컴포넌트는 Testing Library + jsdom/happy-dom 환경
- 커버리지는 v8 provider — 숫자보다 **위험 경로 커버** 우선

## 설정 메모
- `TODO(✍️):` test 환경(jsdom/happy-dom)·setup 파일·커버리지 임계는 프로젝트 셋업 시 확정
