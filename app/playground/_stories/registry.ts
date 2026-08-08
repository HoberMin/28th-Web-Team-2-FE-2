import { badgeMapLocationStory } from "./badge-map-location";
import { badgeMoreStory } from "./badge-more";
import { badgeReportDateStory } from "./badge-report-date";
import { badgeStoreStatStory } from "./badge-store-stat";
import { buttonStory } from "./button";
import { buttonCircleStory } from "./button-circle";
import { cardNewsStory } from "./card-news";
import { cardRecommendedStoreStory } from "./card-recommended-store";
import { cardStoryListStory } from "./card-story-list";
import { colorStory } from "./color";
import { filterChipStory } from "./filter-chip";
import { gridVegetableItemStory } from "./grid-vegetable-item";
import { headerStoreDetailStory } from "./header-store-detail";
import { imageGrassStory } from "./image-grass";
import { imageVegetableOnionStory } from "./image-vegetable-onion";
import { itemVegetableStory } from "./item-vegetable";
import { listLowestVegetableStory } from "./list-lowest-vegetable";
import { listRecentReportStory } from "./list-recent-report";
import { listSortOptionStory } from "./list-sort-option";
import { listStoryStory } from "./list-story";
import { loadingCircularStory } from "./loading-circular";
import { markerStoreMapStory } from "./marker-store-map";
import { navGnbStory } from "./nav-gnb";
import { radiusStory } from "./radius";
import { rowRecentReportStory } from "./row-recent-report";
import { rowRecommendedStoreStory } from "./row-recommended-store";
import { rowStoreVegetablesStory } from "./row-store-vegetables";
import { rowSortOptionStory } from "./row-sort-option";
import { rowStoryStory } from "./row-story";
import { sectionRecentReportStory } from "./section-recent-report";
import { sheetSortStory } from "./sheet-sort";
import { sheetHandleStory } from "./sheet-handle";
import { sheetStoreDetailStory } from "./sheet-store-detail";
import { tabBarStory } from "./tab-bar";
import type { Story } from "./types";
import { textFieldStory } from "./text-field";
import { typographyStory } from "./typography";
import { vegetablePriceStory } from "./vegetable-price";
import { vegetableTrendStory } from "./vegetable-trend";

// 스토리 등록부 — 규격(컴포넌트·토큰) 하나 = _stories/ 파일 하나 = 여기 한 줄.
// 디자이너가 새 규격을 작업하면 파일을 추가하고 여기 등록한다 (design-guide.md 플레이그라운드 규약)
//
// 2026-08-05 (1차): 컴포넌트 스토리 7종과 그 구현을 삭제했다. 전신 프로젝트(Looky) Figma
// 파일에서 온 규격이라 현 Design Library에 원본이 없었다 — §1-1 "Figma에 있는 규격만".
//
// 2026-08-05 (2차): Design Library `컴포넌트` 섹션(node 186-3268)에서 Variant 속성이 정식으로
// 잡힌 컴포넌트 세트 4종을 구현·등록했다:
//   button/cta(160-2855) · field/text(237-8556) · filter/chip(237-10450) ·
//   grid/vegetable-price(224-7408)
//
// 2026-08-05 (3차): 같은 섹션을 다시 읽어(MCP get_metadata/get_design_context) 최신화했다.
//   · 기존 4종은 Figma 스펙 변화 없음 — 코드 그대로 유효하다.
//     (grid/vegetable-price의 price=16pt 2종은 2차 때 이미 반영돼 있었다)
//   · 새로 등록: nav/gnb(223-7003) · grid/vegetable-trend(224-7405) · badge/more(185-1912)
//
// 2026-08-06: Figma 링크 3개 반영 — "플레이그라운드 컴포넌트들 실제로 작동하게" 요청.
//   · button/cta_md(160-2855) 재sync: size(medium·small) 축 + variant `outlined` 추가.
//   · field/text(237-8556) 재sync: focused state 추가(실측 결과 normal과 시각 차이 없음).
//   · button/circle(350-17885) 신규 등록 — 찜(좋아요) 토글 데모.
//
// ── 2026-08-08: `컴포넌트` 섹션(부모 437-28228) 미구현분을 **2배치로 나눠 전부 반영**했다. ──
//
//   1배치 — 토큰 재검증 + 기반/아이템/행 컴포넌트 (신규 12종):
//     loading/circular(436-25632) · badge/report-date(359-18591) · badge/store-stat(392-11448) ·
//     item/vegetable(185-1520) · row/story(186-3196) · list/story(186-3208) ·
//     row/store-vegetables(185-2042) · list/lowest-vegetable(227-3463) ·
//     row/recent-report(359-18537) · list/recent-report(392-11786) ·
//     grid/vegetable-item(237-11384) · marker/store-map(439-7518)
//   + button/cta(160-2855) 재sync: **state `loading` 추가**, 그리고 small에도 pressed·disabled가
//     생겨(436-25249 등) 심볼이 22 → 28개가 됐다. 스토리 목록을 그에 맞춰 넓혔다.
//   + 토큰 재검증: Raw/Semantic/Radius 전부 **drift 없음**. 다만 Figma의 "Variables Documentation"
//     프레임(126-1092) 자체가 stale이다(문서 58/24/5 vs 실제 변수 59/34/7) — 우리 코드가 아니라
//     그 문서 페이지가 갱신되지 않은 것이다.
//
//   2배치 — 카드 · 합성 패턴 · 순수 에셋 (신규 9종):
//     card/story-list(186-3233) · row/recommended-store(185-2117) ·
//     card/recommended-store(185-2359) · card/news(253-2136) ·
//     header/store-detail(392-12144) · section/recent-report(392-12708) ·
//     sheet/store-detail(392-12707) · image/grass(185-1460) · image/vegetable-onion(185-1654)
//   + `--shadow-sheet` 토큰 신설(globals.css) — sheet/store-detail의 노드 Effect 값.
//     shadow-floating과 색 계열은 같지만 오프셋·블러·투명도가 달라 합칠 수 없었다.
//   + header/store-detail·section/recent-report·sheet/store-detail은 조합 규칙이라 group="패턴".
//
// ── 2026-08-08 (2차): `(공유) Component` 페이지(477-9098) 전수 실측 → **코드와 다른 곳을 맞췄다.** ──
//
//   Figma가 진실 소스이므로, 어긋난 곳은 전부 Figma 쪽으로 맞췄다:
//   · `text/vegetable-trend`(477-5291) — **state 축(down·up·flat) 신설**. 기존 코드는 down 고정에
//     색이 `trend/down` 하드코딩이었다. flat은 Figma 원본에 값 텍스트가 없어 아이콘만 렌더한다.
//     (lines=2 × flat 심볼은 Figma에 없어 만들지 않았다.)
//   · `button/circle`(477-5182) — **size 축(36·48) 신설**. 아래 남은 이슈 ③ 해소.
//     36px 그림자 blur가 2.25px이라 `--shadow-floating-sm` 토큰을 신설했다.
//   · `button/base`(477-5003) — secondary의 **pressed 배경이 size별로 다른 토큰**에 바인딩돼 있는데
//     (medium `content/secondary` / small `action-secondary/pressed`) 코드가 medium 값을 두 size에
//     함께 쓰고 있었다. size별로 갈랐다.
//   · 정렬 시트 계열 — 아래 남은 이슈 ④ 해소. Design Library의 네 규격을 각각 분리 구현했다:
//     sheet/sort(318-15278) · list/sort-option(318-15246) · row/sort-option(318-14915) ·
//     sheet/handle(318-15226). 화면GUI 복제본이 아니라 Design Library를 정본으로 삼는다.
//
//   실측했지만 **코드를 바꾸지 않은 것**(Figma 원본 유지 + 사실만 기록, figma-bridge §4):
//   · `icon/heart-stroke-regular`만 23×23px(다른 17종은 24×24) → 코드는 24px 그리드로 정규화
//   · 16px 아이콘 내부 도형이 24px 원본의 스케일 축소본이라 소수점(`radius/sm`이 2.667px로 나온다)
//   · `text/vegetable-price`·`text/vegetable-trend`의 111.333px vs 담는 그릇 112px (코드는 w-full)
//   · 그림자 3종(3px · 2.25px · 3.273px) · 시트 상하 패딩 불일치 · badge 계열 py 2 vs 4
//   · 대비 미달 다수(아래 각 컴포넌트 파일 주석에 수치 기록)
//
// ── 2026-08-08 에셋 후속 sync (원격 반영분 — 위 2차 작업과 합쳤다) ──
//   · Figma Plugin API로 아이콘 18종과 컨텍스트 오버라이드 아이콘 10종을 SVG export.
//   · story/news/vegetable/onion 래스터와 loading 원본 GIF, image/grass SVG를 public에 저장.
//   · card/recommended-store의 Variable 미바인딩 gradient fill도 원본 stop/transform 그대로 SVG화.
//   · 플레이그라운드의 임시 도형·자리표시를 전부 원본 에셋으로 교체 — 스토리는 `figma-asset.tsx`의
//     `FigmaIcon`/`FigmaImage`로 `public/figma/design-library/`를 가리킨다.
//     2차 작업분(button-circle 하트 · vegetable-trend 방향 · sheet-sort 체크 · badge-map-location 핀)도
//     같은 방식으로 원본 에셋에 맞췄다.
//
// 남은 이슈 (구현은 끝났고, 디자이너 확인이 필요한 것들):
//
// ① ~~아이콘·일러스트 에셋을 코드로 가져올 수 없다~~ → **해소.** Plugin API export로 원본 SVG·래스터가
//    `public/figma/design-library/`에 들어왔다. 컴포넌트는 여전히 `ReactNode` 슬롯을 유지하고
//    (에셋을 하드코딩하지 않는다), 스토리가 원본 에셋을 꽂아 검산한다.
//    남은 미확보: 아이콘 세트(477-9106) 중 export되지 않은 나머지 — 필요해질 때 추가 export.
//
// ② card/recommended-store 배경 그라데이션 — **미해결(⛔).** Figma 원본
//    `#f7fff3 → #e8fbd5 → #dbfbb9`가 어느 Variable에도 바인딩돼 있지 않고 우리 팔레트에도 없다.
//    추측 매핑도 raw hex 삽입도 금지라 배경을 비워 뒀다(figma-bridge §3). 디자이너가 Variable로
//    등록하거나 기존 토큰 대체를 승인해야 닫힌다.
//
// ③ ~~button/circle size=36~~ → **2026-08-08 (2차)에 해소.** size 축을 추가했다.
//
// ④ ~~sheet/sort 계열 미구현~~ → **2026-08-08 (2차)에 해소.** `sheet-sort.tsx` 한 파일로 구현했다.
//    아이콘 세트(477-9106, 18종)는 별도 스토리로 등록하지 않았지만 SVG는 export돼 있어(위 ① 참고)
//    각 컴포넌트 스토리에서 원본 그대로 쓰고 있다.
//
// ⑤ 토큰 이름이 Figma에서 바뀌었다 — **값은 같고 이름만 다르다**(렌더 영향 없음):
//      Figma `content/accent/badge`        ↔ 코드 `--color-content-accent`        (둘 다 orange-700)
//      Figma `surface/accent/orange`       ↔ 코드 `--color-surface-accent`        (둘 다 orange-100)
//      Figma `surface/accent/orange-subtle`↔ 코드 `--color-surface-accent-subtle` (둘 다 orange-50)
//    `content/accent/**badge**`는 시맨틱 토큰에 컴포넌트명이 들어간 형태라(배지 밖에선 못 쓴다)
//    이름을 그대로 따라가는 게 옳은지 판단이 필요하다. **디자이너 확인 전까지 코드는 그대로 둔다** —
//    지금 리네임하면 사용처를 다 바꾼 뒤 되돌려야 할 수 있다.
//
// (구 ③ "합성 컴포넌트는 에셋 때문에 옮길 수 없다"는 보류 사유는 **해소됐다** — 에셋을 슬롯으로
//  분리하는 방식으로 전부 구현했다. 위 ①이 그 대체 설명이다.)
export const stories: Story[] = [
  // 파운데이션
  colorStory,
  typographyStory,
  radiusStory,

  // 컴포넌트 — 기반
  buttonStory,
  buttonCircleStory,
  textFieldStory,
  filterChipStory,
  loadingCircularStory,
  sheetHandleStory,

  // 컴포넌트 — 배지·칩·내비
  badgeMoreStory,
  badgeReportDateStory,
  badgeStoreStatStory,
  badgeMapLocationStory,
  navGnbStory,
  tabBarStory,

  // 컴포넌트 — 값 표시
  vegetablePriceStory,
  vegetableTrendStory,

  // 컴포넌트 — 아이템·행·목록
  itemVegetableStory,
  rowStoryStory,
  listStoryStory,
  rowStoreVegetablesStory,
  listLowestVegetableStory,
  rowRecentReportStory,
  listRecentReportStory,
  rowSortOptionStory,
  listSortOptionStory,
  rowRecommendedStoreStory,

  // 컴포넌트 — 격자·카드·마커
  gridVegetableItemStory,
  cardStoryListStory,
  cardRecommendedStoreStory,
  cardNewsStory,
  markerStoreMapStory,

  // 컴포넌트 — 에셋 래퍼
  imageVegetableOnionStory,
  imageGrassStory,

  // 패턴
  headerStoreDetailStory,
  sectionRecentReportStory,
  sheetStoreDetailStory,
  sheetSortStory,
];
