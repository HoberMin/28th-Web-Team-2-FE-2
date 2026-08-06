import { badgeMoreStory } from "./badge-more";
import { buttonStory } from "./button";
import { buttonCircleStory } from "./button-circle";
import { colorStory } from "./color";
import { filterChipStory } from "./filter-chip";
import { navGnbStory } from "./nav-gnb";
import { radiusStory } from "./radius";
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
// 아직 보류 중인 것과 그 이유(2026-08-05 3차 기준으로 갱신):
//
// ① 아이콘 9종 — chevron-right/left/up/down(186-3361·3387·3395·3394),
//    close-fill(318-13681), search(285-2205), map-pin-fill(285-2204),
//    store-fill(185-2134), store-stroke(218-2979)
//    → **에셋 바이트를 코드로 가져올 수 없다.** 정식 MCP 도구 `download_assets`를 실제로
//      호출해 확인했는데, 반환값이 SVG 파일이 아니라 `figma.com/api/mcp/asset/...` URL이고
//      그 URL을 받으려면 curl/WebFetch로 figma.com에 접근해야 한다 —
//      `.claude/settings.json`의 deny가 정확히 그걸 막는다(figma-bridge §0-0).
//      해소 경로는 둘 중 하나: 디자이너가 SVG를 레포로 직접 전달하거나,
//      MCP가 발급하는 에셋 호스트만 예외로 허용하도록 사람이 정책을 조정하는 것.
//    → store-fill·store-stroke 옆에는 디자이너 노트 "만들어야함"(185-2142)이 아직 남아 있어
//      규격 자체도 확정 전이다.
//
// ② 합성 컴포넌트 — card/story(186-3196) · list/story(186-3208) · card/price-story(186-3233) ·
//    list/storecard-vegetable(185-2042) · row/recommended-store(185-2117) ·
//    card/recommended-store(185-2359) · list/lowest-vegetable(227-3463) ·
//    carousel/price-item(253-2136) · grid/vegetable-item(237-11384) ·
//    item/vegetable(185-1520) · image/grass(185-1460)
//    → 전부 야채 일러스트·썸네일 사진·아이콘 같은 에셋을 품고 있어 ①이 풀려야 옮길 수 있다.
//      Variant 축도 없어(단일 심볼) 아직 조합 규칙이 확정된 상태로 보기 어렵다.
//
// ③ slot/visual(185-1576) — Figma 안에서 "여기에 비주얼이 들어간다"를 표시하는 빈 슬롯이라
//    코드로 옮길 대상이 아니다.
export const stories: Story[] = [
  colorStory,
  typographyStory,
  radiusStory,
  buttonStory,
  buttonCircleStory,
  textFieldStory,
  filterChipStory,
  vegetablePriceStory,
  vegetableTrendStory,
  badgeMoreStory,
  navGnbStory,
];
