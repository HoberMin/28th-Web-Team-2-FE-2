# Figma 최종본 ↔ 구현 코드 대조 (2026-08-21)

기준은 두 개뿐이다. **Figma [화면GUI(원본)](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=289-13390) 45개 프레임**과 **레포의 실제 코드**.
로컬 기획서·기능정의서(`shared/`·`농산물-문서/`)는 근거로 쓰지 않았다 — 내용이 낡아 Figma와 어긋난다.

MECE 축: 화면 하나가 아래 4칸 중 정확히 한 칸에 들어간다.

| | Figma에 있음 | Figma에 없음 |
|---|---|---|
| **코드에 있음** | ① 양쪽 존재 (→ 값 대조) | ③ 코드 전용 |
| **코드에 없음** | ② 미구현 | — |

---

## ① 양쪽 존재 — 화면 매핑 (13개 라우트 / Figma 44프레임)

| Figma 프레임 | 코드 | 비고 |
|---|---|---|
| F00_온보딩 (765:9108) | `app/onboarding` → `steps/intro-step.tsx` | |
| F00_온보딩_닉네임 ×3 (796:12016 · 823:9628 · 829:9899) | `steps/nickname-step.tsx` | Figma 프레임 3개가 같은 이름 |
| F00_온보딩_지역 ×3 (819:9113 · 836:12368 · 836:12442) | `steps/region-step.tsx` | 근처 동네 / 검색 결과 / 키보드 상태 |
| F01_홈 (237:9278) · F01_홈_더보기 (253:1437) | `app/(tabs)/page.tsx` | 더보기는 토글 상태로 구현 |
| F02_야채시세 ×3 (237:10103 · 237:11098 · 318:14946) | `app/(tabs)/prices` | 기본 / 검색 키보드 / 정렬 오버레이 |
| F03_가게 ×6 (774:10912 · 319:2924 · 786:11344 · 323:8692 · 439:7211 · 323:7674) | `app/(tabs)/stores` | 축소·확대·마커선택·찜 상태 |
| F03_가게상세 ×3 (1096:18745 · 1096:20421 · 1096:20861) | `app/(detail)/stores/[storeId]` | |
| F03_야채시세 상세 ×9 (639:7892 외) | `app/(detail)/prices/[itemId]` | 섹션 앵커·정렬·바텀시트 상태 |
| F04_찜_야채 (318:15814) · F04_찜_가게 (318:15555) | `app/(tabs)/saved` | |
| F04-1_야채 제보 ×5 (755:28000 · 831:34939 · 819:9249 · 1082:10730 · 1094:15124) | `app/report` | 기본 / 입력완료 / 야채 인식 모달 |
| F04-2_야채 카테고리 ×5 (831:35121 외) | `app/report/vegetable` | 카테고리 / 야채 목록 / 검색 후 / 결과 없음 / 선택 |
| F04-3_판매 장소 선택 (755:28123) | `app/report/place` | |
| F04-4_제보 완료 (1069:10328) | `app/report/done` | |

## ② Figma에 있는데 코드에 없음 — 1건

| Figma | 지금 | 막힌 지점 |
|---|---|---|
| **F04-1_야채 제보_양 단위 편집** ([785:29971](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=785-29971)) 의 [list/unit-option](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=831-35676) | 코드에는 단위 **드롭다운이 없다**. 양 입력칸 오른쪽은 선택 불가한 단위 **표시**(`FieldUnitDisplay`)다 | 제보 저장 API가 품목의 `defaultUnit` 문자열과 **정확히 같은 값만** 받는다. Figma는 kg / g / 개 / 포기 **4종 고정 선택**이라 정면 충돌 |

Figma 실측 (구현 시 그대로 쓸 값):
- 컨테이너 — `bg surface/primary` · `border border/primary 1px` · `p-[2px]` · `radius/lg 12` · 그림자 2겹 `0 2px 4px -2px rgba(23,23,23,.06)`, `0 4px 6px -1px rgba(23,23,23,.06)` → 이미 만들어 둔 `--shadow-dropdown` 값과 **정확히 일치**
- 행 — `w-[118px]` · `px-[16px] py-[8px]` · `radius/md 8` · `body/16-medium` · `content/primary`
- 선택 행 — 배경만 `surface/secondary` (컴포넌트 variant가 아니라 그 자리에서 칠한 것 → 디자인팀 확인 항목 9번)

**결정 필요**: BE에 단위 선택을 요청할지 / 이 화면을 시안에서 뺄지. 둘 다 정해지기 전엔 구현하면 저장이 실패한다.

## ③ 코드에 있는데 Figma에 없음 — 2건

| 코드 | 지금 | 왜 문제인가 |
|---|---|---|
| `app/(tabs)/mypage` (마이페이지) | 프로필·이번 주 제보 스트립·내 제보 목록·동네 설정 진입까지 구현돼 있다 | Figma 최종본에 **내 정보 화면 프레임이 없다.** 그런데 [nav/gnb](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=253-1415)에는 「내 정보」 탭이 있어 갈 곳은 필요했다 → 시안 없이 만든 화면이라 **대조 기준이 없다** |
| `app/(detail)/mypage/regions` (동네 설정) | 지역 변경 화면 | 위와 같음 |

`app/playground`는 팀 검증용 갤러리라 이 대조 대상이 아니다.

---

## ④ 양쪽에 있는데 값·동작이 다름

### 오늘 고친 것 (6)

| 대상 | Figma | 고치기 전 코드 |
|---|---|---|
| [tab-section](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=1116-11888) 선택 탭 (F03 야채시세 상세) | `body/16-bold` · `content/primary` · 밑줄 `border-b-2 border/tertiary` | 실제 렌더는 `body/16-medium`. 08-20에 bold를 넣었지만 공통 클래스의 medium과 겹쳐 CSS 순서에서 밀렸다 |
| 같은 탭의 **비선택** 밑줄 | `border-b 1px border/secondary` | `border-b-2 transparent` |
| 같은 탭 바 그림자 | 없음 (`border-b`만) | 임의 그림자 `0 2px 3px rgba(0,0,0,.04)` |
| [comment-section-notice](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=1116-11932) 문구 | `body/14-medium` · `content/disabled` | `body/14-bold` · `content/primary` |
| [field/price 입력됨](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=1183-24040) | "1,000원"이 한 덩어리 · `body/16-semibold` · `content/primary` · 왼쪽 정렬 | 「원」이 박스 오른쪽 끝까지 밀려 있고 `body/16-medium` · `content/secondary` |
| [F00_온보딩](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=765-9108) 일러스트 | 배경 안에 전체가 들어옴 | 844px 절대좌표라 짧은 기기에서 아래가 잘림 |
| 가게 시트 찜 하트 | 찜함 = 회색 채움 | 평상시 회색이지만 `:active` 초록이 뒤에 적용돼 누르는 동안 초록 (iOS는 다음 터치까지 유지) |

### 남은 불일치 (6)

| # | 대상 | Figma | 코드 | 막힌 지점 |
|---|---|---|---|---|
| 1 | [category-list](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=831-35271) (F04-2) | **8종** — 뿌리채소 · 잎채소 · 열매채소 · 고추류 · 마늘·파·생강 · 버섯류 · **깨·견과류** · 과일류 | 7종 (깨·견과류 없음). 참깨·땅콩은 마늘·파·생강에 묶여 있다 | Spring `ItemCategory` enum에 대응 값이 없다 → **BE 요청** |
| 2 | [filter/chip](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=318-15508) (F02) 첫 카테고리 라벨 | 「**감자·뿌리** 5」 | 「뿌리채소」 | 같은 Figma 안에서 F02와 F04-2가 서로 다르다. 3·4·5번째 칩은 「잎채소 12」로 복제돼 있어 나머지를 알 수 없다 → **디자인팀 확정 필요** (피드백 8번) |
| 3 | sheet/sort 정렬 종류 (F02) | 가나다순 · 시세보다 저렴한 순 · 최근 제보순 | 이름순 · 가격 낮은순 · 가격 높은순 | 서버가 3종만 지원 → **BE 요청** |
| 4 | [sheet/store-detail](https://www.figma.com/design/WfW1Nkx1oiOWBHNwrw48IL/Design-Library?node-id=392-12890) (F03 가게선택) | 영업시간 · 도보시간 · 저렴한 야채 수 · 오늘 제보 수 | 해당 줄 없음 | 주변 가게 API 응답에 없다 → **BE 요청** |
| 5 | `icon/information-circle-2` 20px (F03 야채시세 상세) | 벡터 20px | 레포의 `information-circle.svg`는 **16px PNG를 SVG로 감싼 파일** — 20px로 늘리면 뭉갠다 | 원본 미수령 → **아이콘 일괄 교체 때** |
| 6 | 아이콘·이미지 원본 7건 | — | `image/onboarding`·`image/logo` 화질 / 야채 아이콘이 프레임 아닌 그림만 export / `icon/heart` / `icon/sparkle` 미수령 / `icon/person-fill` 여백 부족 | **오늘 저녁 일괄** |

---

## 후속 액션

**BE 요청 (4)** — 깨·견과류 카테고리 · 정렬 3종 · 주변 가게 4개 필드 · (결정되면) 단위 선택
**디자인팀 전달 (18항목)** — `디자인_docs/feedback/0821/화면리뷰.md`
**아이콘 일괄 (7)** — 오늘 저녁
**결정 필요 (2)** — 양 단위 편집 화면을 살릴지 / 마이페이지 시안을 그릴지

## 검증 방법

- Figma: `get_metadata`로 45프레임 전체 트리를 뽑고, 차이가 의심되는 노드만 `get_design_context`로 실측
- 코드: 라우트·컴포넌트 전수 + 전 파일 클래스 충돌 스캔(같은 CSS 속성 유틸이 한 요소에 둘 붙는 경우)
- `pnpm build` 통과 · 유닛 46 files / 325 tests 통과
- ⚠️ CI `Quality`의 E2E 11건은 **이전부터** 실패 중이다(지도·온보딩 라우팅). 이번 작업과 무관하나 방치하면 회귀를 못 잡는다
