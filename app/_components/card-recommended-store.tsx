import type { ReactNode } from "react";
import { RowRecommendedStore, type RowRecommendedStoreProps } from "./row-recommended-store";
import { RowStoreVegetables, type RowStoreVegetablesItem } from "./row-store-vegetables";
import { cn } from "../_lib/cn";

// Figma `card/recommended-store` — Design Library node 185-2359 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 추천 가게 카드 —
// 맨 위 row/recommended-store(185-2117) + 아래 row/store-vegetables(185-2042) + 바닥 장식 image/grass(185-1460).
//
// get_design_context 실측:
//   루트     radius/xl(16px) · pt-[20px] pb-[32px] px-[20px] · w-[358px]
//            → rounded-xl pt-5 pb-8 px-5 (358px는 프레임 폭이라 w-full)
//   content  flex-col gap-[12px] w-full → gap-3
//   grass    카드 바닥에 **absolute bottom-0 가운데 정렬**, h-[30px] w-[358px]
//            → absolute bottom-0 left-1/2 -translate-x-1/2
//   안쪽 두 줄은 이미 구현된 RowRecommendedStore·RowStoreVegetables를 그대로 재사용한다.
//
// ⛔ **미해결 — 카드 배경(그라데이션)은 옮기지 못했다.**
//    Figma 원본은 세로 그라데이션 `#f7fff3 8.654% → #e8fbd5 70.673% → #dbfbb9 100%`인데,
//    이 세 색이 **어느 Variable에도 바인딩돼 있지 않다.** get_variable_defs(185-2359)를 호출해
//    확인했고, 반환된 15개 변수(content/*, border/primary, radius/xl 등) 안에 그라데이션 색이 없다.
//    세 값 모두 우리 팔레트에 없는 색이다(가장 가까운 green/50이 #ecfdf4로 서로 다르다).
//    → figma-bridge §3 "매핑 안 되는 변수 → 추측 금지, 실패 처리"에 해당한다. raw hex나
//      arbitrary value로 박아 넣는 것도 금지라(토큰 화이트리스트), **배경을 기본값으로 넣지 않았다.**
//    → 그래서 이 컴포넌트는 배경 없이 렌더된다. 표면색은 `className`으로 호출부가 준다.
//    → 해소 방법 둘 중 하나: 디자이너가 그라데이션 3색을 Figma Variable로 등록하거나,
//      기존 토큰(예: surface/brand)으로 대체하는 걸 승인하는 것.
//
// ⚠️ 대비 — 그라데이션이 확정되면 다시 재야 하지만, Figma 원본 그라데이션 값 기준으로 미리 계산해 둔다
//    (밝은 끝 #f7fff3 / 짙은 끝 #dbfbb9):
//      가게 이름 content/primary      13.22 ~ 11.91:1 → 통과
//      거리 content/secondary (16px)   4.69 ~ **4.23:1** → 짙은 끝에서 미달
//      요약 강조 content/brand/light   3.27 ~ **2.95:1** → 양쪽 다 미달 (14px 기준 4.5:1)
//      야채 이름 content/secondary(12px)      **4.23:1** → 미달
//    흰 배경일 때보다 나빠지는 조합들이라, 그라데이션을 확정할 때 같이 봐야 한다.

export interface CardRecommendedStoreProps
  extends Omit<RowRecommendedStoreProps, "className"> {
  /** 아래 줄에 늘어놓을 야채들. */
  vegetables: RowStoreVegetablesItem[];
  /** 화면에 못 담은 나머지 야채 개수. */
  moreCount?: number;
  /** 바닥 장식 풀 그림(`ImageGrass`). 없으면 그리지 않는다. */
  grass?: ReactNode;
  /**
   * 카드 표면색. Figma 그라데이션을 토큰으로 옮기지 못해(위 ⛔ 참고) **호출부가 지정해야 한다.**
   * 지정하지 않으면 배경 없이 렌더된다 — 그 상태가 "아직 미해결"이라는 신호다.
   */
  className?: string;
}

export function CardRecommendedStore({
  vegetables,
  moreCount,
  grass,
  className,
  ...rowProps
}: CardRecommendedStoreProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center overflow-hidden rounded-xl px-5 pt-5 pb-8",
        className,
      )}
    >
      <div className="flex w-full flex-col items-start gap-3">
        <RowRecommendedStore {...rowProps} />
        <RowStoreVegetables items={vegetables} moreCount={moreCount} />
      </div>
      {grass ? (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">{grass}</div>
      ) : null}
    </div>
  );
}
