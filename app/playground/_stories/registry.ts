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
import { listStoryStory } from "./list-story";
import { loadingCircularStory } from "./loading-circular";
import { markerStoreMapStory } from "./marker-store-map";
import { navGnbStory } from "./nav-gnb";
import { radiusStory } from "./radius";
import { rowRecentReportStory } from "./row-recent-report";
import { rowRecommendedStoreStory } from "./row-recommended-store";
import { rowStoreVegetablesStory } from "./row-store-vegetables";
import { rowStoryStory } from "./row-story";
import { sectionRecentReportStory } from "./section-recent-report";
import { sheetStoreDetailStory } from "./sheet-store-detail";
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
//   · button/circle(350-17885) 신규 등록 — 찜(좋아요) 토글 데모, 아이콘은 스토리 안 임시 placeholder.
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
// 남은 이슈 (구현은 끝났고, 디자이너 확인이 필요한 것들):
//
// ① 아이콘·일러스트 에셋 — **여전히 코드로 가져올 수 없다.** `download_assets`가 SVG 바이트가
//    아니라 figma.com 서명 URL을 돌려주고, 그 URL을 받으려면 REST 접근이 필요한데
//    `.claude/settings.json`의 deny가 그걸 막는다(figma-bridge §0-0). 팀 정책이라 유지한다.
//    → 그래서 모든 아이콘·사진·일러스트 자리는 `ReactNode` 슬롯으로 열어 두었고, 스토리에서는
//      임시 도형/자리표시로 대신 보여 준다. 디자이너가 SVG를 레포로 직접 전달하면 그대로 꽂힌다.
//
// ② card/recommended-store 배경 그라데이션 — **미해결(⛔).** Figma 원본
//    `#f7fff3 → #e8fbd5 → #dbfbb9`가 어느 Variable에도 바인딩돼 있지 않고 우리 팔레트에도 없다.
//    추측 매핑도 raw hex 삽입도 금지라 배경을 비워 뒀다(figma-bridge §3). 디자이너가 Variable로
//    등록하거나 기존 토큰 대체를 승인해야 닫힌다.
//
// ③ button/circle에 size=36 변형이 생겼다(477-3372·3375·3378·3381). 우리 button-circle.tsx는
//    48px 하나만 지원한다 — size 축 추가가 필요하다(이번 배치 범위 밖).
//
// ④ 아직 구현하지 않은 규격: sheet/sort(318-15278) 계열(list/sort-option·row/sort-option·
//    sheet/handle)과 아이콘 세트(sec/icon 436-28079). 정렬 시트는 별도 흐름이라 다음 배치로 남긴다.
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

  // 컴포넌트 — 배지·칩·내비
  badgeMoreStory,
  badgeReportDateStory,
  badgeStoreStatStory,
  navGnbStory,

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
];
