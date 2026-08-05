# 디자인_docs

디자이너가 전달하는 **Figma Variables 원본 파일**을 날짜·버전으로 아카이빙하는 폴더.
목적은 추적성(traceability) — "이 시점에 디자이너가 무엇을 전달했는지"의 기록.

> ⚠️ 이 폴더는 진실 소스가 아니다. 토큰의 진실 소스는 여전히 **Figma Variables → `app/globals.css`의 `@theme static`**
> (`shared/design-guide.md` §0). 여기 쌓인 파일은 실제 코드에 반영된 스냅샷을 만들기 위한 **입력 이력**일 뿐,
> 여기 값을 직접 참조해서 코드를 작성하지 않는다. 반영은 항상 figma-implementer → `@theme static` 경로로.
>
> `shared/conventions.md` #12(레포 산출물은 코드+`/playground`+`shared/` 문서로 한정)의 **명시적 예외** —
> 2026-08-05, 사용자 요청으로 추적 가능한 variables 아카이브 용도로 신설.

## 규칙

- 디자이너가 variables 파일을 전달할 때마다 이 폴더(또는 하위 `variables/`)에 원본 그대로 추가한다. 가공·수정 금지.
- 파일명: `<원본이름>_YYYY-MM-DD_v0N.<ext>`
  - 예: `variables_2026-08-05_v01.json`
  - 같은 날 여러 번 전달되면 `v01` → `v02`로 증가. 다른 날이면 `v01`부터 다시 시작.
- 과거 파일은 삭제하지 않고 누적한다 (이력이 목적이므로).
