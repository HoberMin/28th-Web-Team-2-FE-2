import type { ReactNode } from "react";
import Link from "next/link";
import { ROUTES } from "../_lib/routes";
import { VegetablePrice } from "./vegetable-price";
import { VegetableTrend, type VegetableTrendState } from "./vegetable-trend";
import { cn } from "../_lib/cn";

// Figma `list/lowest-vegetable` — Design Library node 227-3463 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). "가장 싼 야채" 랭킹의 한 줄 —
// 순위 · 야채 그림 · 이름 · 파는 가게 · 가격 · 등락을 한 행에 담는다.
//
// ⚠️ 이름은 `list/…`지만 Figma 심볼은 **행 하나**다(안에 반복 구조가 없다). 이름을 바꾸지 않고
//    원본 그대로 두되, 여러 줄을 쌓는 건 호출부가 한다.
//
// get_design_context 실측:
//   루트        flex items-center justify-between py-[10px] w-[358px]
//               → items-center justify-between py-2.5 (358px는 프레임 폭이라 w-full)
//   순위        body/16-semibold · content/secondary · w-[20px] h-[24px] text-center → w-5 h-6
//   leading gap flex gap-[8px] items-center → gap-2
//   야채 묶음   flex gap-[12px] items-center → gap-3
//   야채 그림   40×40 → size-10 슬롯. (2026-08-21: 한때 홈 추천 가게 카드와 맞추려 48×48로
//     키웠었는데, 마늘·양파·고구마 벡터가 SVG 필터 이펙트를 써서 48로 확대하면 화질이
//     눈에 띄게 뭉개졌다 — 사용자 QA 피드백으로 발견, Figma 원본 규격 40×40으로 되돌렸다.)
//   info        flex-col gap-[2px] w-[140px] → gap-0.5 w-35
//     이름      body/16-semibold · content/primary · 한 줄 말줄임
//     가게 줄   flex gap-[2px] items-start → gap-0.5 / 가게 아이콘 16×16 슬롯
//               (2026-08-20 재실측 429:16752 — 이전 값 4px에서 2px로 바뀌었다)
//               가게 이름 caption/12-regular · content/secondary · 한 줄 말줄임
//   price-block flex-col gap-[2px] w-[112px] → gap-0.5 w-28
//               **items-end**(우측 정렬) — UI QA 2026-08-20 #6 "제보된 야채 가격과 공공시세 비교가
//               우측 정렬 되어야함". 이전엔 items-start라 가격 줄만 justify-end로 밀려 있고
//               등락 줄은 왼쪽에 붙어 두 줄의 오른쪽 끝이 어긋났다.
//     가격      text/vegetable-price size=16(body/16-bold) lines=1, **오른쪽 정렬**(justify-end)
//     등락      text/vegetable-trend lines=1
//   → 가격·등락은 이미 구현된 VegetablePrice·VegetableTrend를 그대로 재사용한다.
//
// 샘플 양파와 16px 가게 아이콘 원본은 public에 export했다. 데이터 교체를 위해 슬롯은 유지한다.
//
// ⚠️ 대비 (기존에 이미 기록된 미달이 그대로 따라온다 — Figma 원본 유지):
//      단위 표기 content/disabled(#b4bbcb) on 흰 배경 = 1.92:1 (기준 4.5:1) → 미달
//      등락 텍스트 trend/down(#217cf9) on 흰 배경     = 3.95:1 (기준 4.5:1) → 미달
//    통과: 순위·가게 이름 content/secondary 4.79:1 · 야채 이름 content/primary 13.51:1

export interface ListLowestVegetableProps {
  /** 순위 숫자. Figma는 20px 폭에 가운데 정렬된 한 자리 숫자를 보여준다. */
  rank: number;
  /** 야채 시세 상세로 이동할 itemId. */
  itemId?: string;
  /** 야채 그림 슬롯(40×40). */
  visual: ReactNode;
  /** 야채 이름. */
  name: string;
  /** 가게 아이콘 슬롯(16×16). */
  storeIcon?: ReactNode;
  /** 파는 가게 이름. */
  storeName: string;
  /** 가격 문자열. 예: "24,900원" */
  price: string;
  /** 단위 문자열. 예: "/100kg". 환산 가격이면 생략한다. */
  unit?: string;
  /** 등락 금액. 예: "100,000원" */
  trendAmount: string;
  /** 등락률. 예: "(-7.4%)" */
  trendPercent: string;
  /** Figma의 방향 아이콘 슬롯(16×16). */
  trendIcon?: ReactNode;
  /**
   * 등락 방향. `VegetableTrend`의 state 축을 그대로 통과시킨다.
   * 이 prop이 없던 동안 홈 최저가 목록이 항상 down(파랑)으로만 그려져서, 아이콘은 상승인데
   * 글자는 하락색인 모순이 났다. `GridVegetableItem`과 같은 처리다.
   */
  trendState?: VegetableTrendState;
  className?: string;
}

export function ListLowestVegetable({
  rank,
  itemId,
  visual,
  name,
  storeIcon,
  storeName,
  price,
  unit,
  trendAmount,
  trendPercent,
  trendIcon,
  trendState = "down",
  className,
}: ListLowestVegetableProps) {
  const content = (
    <div className={cn("flex w-full items-center justify-between py-2.5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <p className="h-6 w-5 shrink-0 text-center text-body-16-semibold text-content-secondary">
          {rank}
        </p>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden"
          >
            {visual}
          </span>
          <div className="flex w-35 min-w-0 flex-col items-start gap-0.5">
            <p className="w-full truncate text-body-16-semibold text-content-primary">{name}</p>
            <div className="flex w-full items-start gap-0.5">
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center text-content-secondary"
              >
                {storeIcon}
              </span>
              <p className="min-w-0 flex-1 truncate text-caption-12-regular text-content-secondary">
                {storeName}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-28 shrink-0 flex-col items-end gap-0.5">
        <VegetablePrice value={price} unit={unit} size="16" lines={1} className="justify-end" />
        <VegetableTrend
          amount={trendAmount}
          percent={trendPercent}
          lines={1}
          state={trendState}
          icon={trendIcon}
          className="justify-end"
        />
      </div>
    </div>
  );

  return itemId ? (
    <Link
      href={ROUTES.priceDetail(itemId)}
      aria-label={`${name} 야채 시세 상세 보기`}
      className="block w-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
