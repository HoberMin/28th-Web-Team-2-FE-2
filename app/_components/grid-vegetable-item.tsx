import type { ReactNode } from "react";
import { VegetablePrice } from "./vegetable-price";
import { VegetableTrend } from "./vegetable-trend";
import { cn } from "../_lib/cn";

// Figma `grid/vegetable-item` — Design Library node 237-11384 / 417-24374 (프레임 417-24373,
// fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `favorite`(false·true) 하나 — 심볼 2개.
// 격자에 깔리는 야채 카드 — 사진 · 이름 · 가격 · 등락, 사진 우상단에 찜 하트.
//
// get_design_context 실측:
//   루트        flex-col gap-[8px] items-start h-[199.333px]
//               → gap-2. 높이는 내용에서 자연히 나오는 값이라 고정하지 않는다.
//   image 박스  110×110 → size-27.5
//               bg background/secondary(#f9f9fb) · border border/img(common/black5, 5% 검정)
//               · radius/lg(12px) · overflow-clip
//   favorite    사진 박스 기준 **absolute right-[-1px] top-[-1px] size-[36px]** → -top-px -right-px size-9
//               (테두리 1px 바깥으로 1px 튀어나오게 놓여 있다 — 원본 그대로 옮겼다)
//               favorite=false → icon/heart-stroke-regular 23×23
//               favorite=true  → icon/heart-fill 24×24
//   info        flex-col gap-[2px] w-[110px] → gap-0.5 w-27.5
//     이름      body/14-semibold · content/primary (말줄임 없음 — Figma가 w-full로만 잡아 뒀다)
//     price     text/vegetable-price size=14(body/14-bold) lines=1
//     trend     text/vegetable-trend lines=1
//   → 가격·등락은 이미 구현된 VegetablePrice·VegetableTrend를 재사용한다.
//
// ⚠️ 사진과 하트 아이콘은 슬롯으로 비워 뒀다 — 둘 다 에셋 다운로드가 정책상 차단돼 있다
//    (figma-bridge §0-0). 디자이너가 heart-stroke-regular(338-8937)·heart-fill(338-8936) SVG를
//    주면 `favoriteIcon`에 그대로 꽂으면 된다.
//
// ⚠️ 이 컴포넌트는 **프레젠테이션 전용**이다. Figma 심볼의 favorite 자리에는 버튼 정의가 없어
//    <button>으로 만들지 않았다. 찜을 실제로 토글하려면 `button/circle`(ButtonCircle)을 쓰거나
//    호출부가 버튼으로 감싼다. 그때 주의: Figma의 36×36은 권장 터치 타겟 44×44보다 작다.
//    (색·아이콘 모양만으로 찜 여부를 전달하지 않도록, 아래에서 sr-only 텍스트를 함께 낸다 — WCAG 1.4.1)
//
// ⚠️ 대비 (Figma 원본 유지):
//      단위 표기 content/disabled(#b4bbcb) on 흰 배경 = 1.92:1 (기준 4.5:1) → 미달
//      등락 텍스트 trend/down(#217cf9) on 흰 배경     = 3.95:1 (기준 4.5:1) → 미달
//      사진 테두리 border/img(검정 5%) on 흰 배경     ≈ 1.12:1 (UI 기준 3:1) → 미달.
//        다만 이건 "흰 사진과 흰 배경의 경계를 아주 옅게 알리는" 장식용 테두리라 정보 전달이
//        걸려 있지 않다(globals.css의 border/img 주석 참고).
//      이름 content/primary 13.51:1 → 통과

export interface GridVegetableItemProps {
  /** 야채 사진 슬롯(110×110). radius/lg와 클리핑은 이 컴포넌트가 씌운다. */
  visual: ReactNode;
  /** 야채 이름. */
  name: string;
  /** 가격 문자열. 예: "249,090원" */
  price: string;
  /** 단위 문자열. 예: "/100kg" */
  unit: string;
  /** 등락 금액. 예: "100,000원" */
  trendAmount: string;
  /** 등락률. 예: "(-7.4%)" */
  trendPercent: string;
  /** Figma의 방향 아이콘 슬롯(16×16). */
  trendIcon?: ReactNode;
  /** Figma의 favorite 축. 찜 여부. */
  favorite?: boolean;
  /**
   * 찜 하트 아이콘 슬롯(36×36 자리). `favorite` 값에 맞는 글리프
   * (false=heart-stroke-regular, true=heart-fill)를 호출부가 골라 넘긴다.
   */
  favoriteIcon?: ReactNode;
  className?: string;
}

export function GridVegetableItem({
  visual,
  name,
  price,
  unit,
  trendAmount,
  trendPercent,
  trendIcon,
  favorite = false,
  favoriteIcon,
  className,
}: GridVegetableItemProps) {
  return (
    <div className={cn("flex flex-col items-start gap-2", className)}>
      <div className="relative size-27.5 shrink-0 overflow-hidden rounded-lg border border-border-img bg-background-secondary">
        {visual}
        <span
          aria-hidden="true"
          className="absolute -top-px -right-px flex size-9 items-center justify-center"
        >
          {favoriteIcon}
        </span>
        <span className="sr-only">{favorite ? "찜한 야채" : "찜하지 않은 야채"}</span>
      </div>
      <div className="flex w-27.5 flex-col items-start gap-0.5">
        <p className="w-full text-body-14-semibold text-content-primary">{name}</p>
        <div className="flex w-full flex-col items-start">
          <VegetablePrice value={price} unit={unit} size="14" lines={1} />
          <VegetableTrend
            amount={trendAmount}
            percent={trendPercent}
            lines={1}
            icon={trendIcon}
          />
        </div>
      </div>
    </div>
  );
}
