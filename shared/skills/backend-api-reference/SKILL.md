---
name: backend-api-reference
description: 외부 Spring API 문서/스펙 읽는 법. BFF가 백엔드에 정확히 맞추도록. 스펙 미확보 시 상상 금지 게이트. api-developer가 참조.
---

# 외부 Spring API 스펙 참조

> **⚠️ 스펙 미확보 상태** — 백엔드 API 문서가 나오면 이 파일에 위치·읽는 법을 채운다.

## 현재 규칙 (스펙 나오기 전)

- **백엔드를 상상해서 만들지 않는다.** 엔드포인트·필드·에러 형식을 지어내는 것 금지.
- 스펙 없이 API 작업 요청이 오면 → **멈추고 스펙(문서 URL·Swagger·예시 응답)을 요청**한다.
- 임시로 진행해야 하면: BFF에 mock 응답을 두되 `TODO(✍️): Spring 스펙 확정 시 교체` 주석 + zod 스키마는 미리 정의(교체 지점 명확화).

## 스펙이 채워지면 기록할 것

- `TODO(✍️):` 문서 위치 (Swagger/Notion/URL)
- `TODO(✍️):` 인증 방식 (토큰 종류·전달 위치 — BFF가 보관)
- `TODO(✍️):` 공통 응답 envelope·에러 형식
- `TODO(✍️):` 환경별 base URL
