import type { ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../_lib/cn";

// Figma `sheet/store-detail` — Design Library node 392-12707 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 조합 패턴. Variant 없음(단일 심볼). 지도에서 가게를 눌렀을 때 아래에서 올라오는 바텀시트 —
// header/store-detail(392-12144) + section/recent-report(392-12708) + 맨 아래 CTA.
//
// get_design_context 실측:
//   루트    bg white(surface/primary) · rounded-t radius/3xl(24px)
//           pt-[28px] pb-[20px] px-[16px] · gap-[20px] · w-[390px]
//           drop-shadow 0px -4px 6px rgba(74,86,103,0.2)
//           → bg-surface-primary rounded-t-3xl pt-7 pb-5 px-4 gap-5 shadow-sheet
//             (390px는 모바일 화면 폭이라 w-full로 따라간다)
//   content flex-col gap-[20px] w-full → gap-5
//   CTA     button/base = **secondary**·medium (bg action-secondary/default #262f3c · px-28 py-12 ·
//           radius/lg · body/16-semibold · content/inverse) · 폭 w-full
//           → Button variant="secondary" + w-full. 문구 "가게 상세 보기"는 Figma 값.
//
// 그림자는 새 토큰 `--shadow-sheet`로 globals.css에 넣었다 — 기존 `--shadow-floating`과
// 색 계열(gray/700)은 같지만 오프셋·블러·투명도가 달라 합칠 수 없다. 자세한 근거는 globals.css 주석.
//
// 헤더와 본문 구획은 슬롯으로 받는다 — 이 시트는 "무엇을 담을지"가 아니라 "어떻게 담을지"를
// 정하는 껍데기이고, 안에 들어가는 HeaderStoreDetail·SectionRecentReport는 각자 props가 많아서
// 여기서 전부 다시 받으면 인터페이스가 두 번 중복된다.
//
// ⚠️ 시트를 여닫는 동작(드래그·백드롭·포커스 트랩)은 이 컴포넌트 밖이다. Figma 심볼은 펼쳐진
//    모습 하나뿐이고, 실제 화면에 붙일 때는 Radix Dialog 등으로 감싸 포커스 트랩·Esc 닫기를
//    붙여야 한다(design-guide §4 "Radix primitive가 있으면 그 위에"). Figma에 sheet/handle
//    (318-15226)이 따로 있지만 이 심볼 안에는 들어 있지 않아 여기서 그리지 않았다.
//
// ⚠️ 대비: CTA는 content/inverse(#f9f9fb) on action-secondary/default(#262f3c) = 12.85:1 → 통과.
//    안에 들어가는 헤더·구획의 미달 항목은 각 컴포넌트 파일에 기록돼 있다
//    (특히 section/recent-report의 빈 상태 1.92:1).

export interface SheetStoreDetailProps {
  /** `HeaderStoreDetail`. */
  header: ReactNode;
  /** `SectionRecentReport` 등 본문 구획. */
  children?: ReactNode;
  /** CTA 문구. 기본값은 Figma 심볼의 문구. */
  actionLabel?: string;
  className?: string;
}

export function SheetStoreDetail({
  header,
  children,
  actionLabel = "가게 상세 보기",
  className,
}: SheetStoreDetailProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-5 rounded-t-3xl bg-surface-primary px-4 pt-7 pb-5 shadow-sheet",
        className,
      )}
    >
      <div className="flex w-full flex-col items-start gap-5">
        {header}
        {children}
      </div>
      <Button
        variant="secondary"
        size="medium"
        leading={false}
        trailing={false}
        className="w-full"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
