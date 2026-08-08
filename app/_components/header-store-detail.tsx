import type { ReactNode } from "react";
import { BadgeStoreStat } from "./badge-store-stat";
import { cn } from "../_lib/cn";

// Figma `header/store-detail` — Design Library node 392-12144 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 조합 패턴. Variant 없음(단일 심볼). 가게 상세 시트 맨 위 —
// 가게 이름 + 액션 버튼 2개 / 영업정보 · 거리 / 통계 배지 2개.
//
// get_design_context 실측:
//   루트       flex-col gap-[8px] items-start w-[358px] → gap-2 (358px는 프레임 폭이라 w-full)
//   title-row  flex items-center justify-between w-full
//     이름     title/20-bold · content/primary · w-[228px] max-w-[228px] → w-57 · 한 줄 말줄임
//     actions  flex gap-[12px] items-center justify-end → gap-3
//   body       flex-col gap-[12px] w-full → gap-3
//     meta     flex-col gap-[4px] → gap-1
//       hours/distance  flex gap-[6px] items-center → gap-1.5
//         앞 텍스트 body/14-semibold · content/primary  (예: "영업중", "670m")
//         dot 2×2 구분점
//         뒤 텍스트 body/14-regular · content/secondary (예: "수 10:00 - 22:00", "도보 10분")
//     stats    flex gap-[8px] items-center → gap-2, badge/store-stat 2개 재사용
//
// 구분점(dot)은 2×2 SVG 에셋이라 색을 특정할 수 없다 — row/recommended-store와 같이
// 옆 텍스트 색을 그대로 쓰게(`bg-current`) 처리했다.
//
// ⚠️ **액션 버튼은 `actions` 슬롯으로 통째로 비워 뒀다.** 이유가 두 가지다:
//    ① 아이콘(heart-stroke-regular · close)을 에셋으로 받을 수 없다(figma-bridge §0-0).
//    ② 여기 쓰인 button/circle은 우리 `ButtonCircle`과 **모양이 다르다** — Figma가 이 자리에서
//       `bg surface/secondary`(회색) + **그림자 없음** + 36×36 + 20px 아이콘으로 **오버라이드**해 두었다.
//       2026-08-08에 ButtonCircle에 size 축(36·48)이 생겨 크기·아이콘은 이제 맞출 수 있지만,
//       **회색 배경 + 그림자 없음 조합은 컴포넌트 세트(477-5182)의 8개 심볼 어디에도 없다** —
//       즉 실화면이 세트 밖 스타일을 쓰고 있다. 디자이너가 variant를 추가해 줘야 닫히는 항목이라
//       임의로 5번째 스타일을 만들지 않았다.
//    ③ 게다가 이 버튼들은 실제로 눌러야 하는데(찜·닫기) 이 컴포넌트는 Server Component로 남아야 해서
//       여기서 핸들러를 만들 수 없다(conventions #10).
//    → 그래서 호출부가 버튼 2개를 직접 조립해 넘긴다.
//
// ✅ 2026-08-08 해소: `button/circle`의 **size=36 변형**(흰 배경 + drop-shadow 2.25px + p-8 + 20px
//    아이콘)을 `button-circle.tsx`에 반영했다. 남은 건 위 ②의 "회색 배경 + 그림자 없음"뿐이다.
//
// ⚠️ 대비: 이름 content/primary 13.51:1 · 앞 텍스트 13.51:1 · 뒤 텍스트 content/secondary 4.79:1 → 전부 통과.
//    배지 자체의 미달값(affordable 4.22:1)은 badge-store-stat.tsx에 기록돼 있다.

export interface HeaderStoreDetailProps {
  /** 가게 이름. 길면 한 줄에서 말줄임된다. */
  name: string;
  /** 영업 상태. 예: "영업중" */
  openState: string;
  /** 영업 시간. 예: "수 10:00 - 22:00" */
  openHours: string;
  /** 거리. 예: "670m" */
  distance: string;
  /** 도보 시간. 예: "도보 10분" */
  walkTime: string;
  /** 저렴한 야채 개수. */
  affordableCount: number;
  /** 오늘 제보된 품목 수. */
  todayReportCount: number;
  /** 오른쪽 위 액션 버튼 묶음(찜·닫기). 위 ⚠️ 참고 — 호출부가 조립한다. */
  actions?: ReactNode;
  className?: string;
}

export function HeaderStoreDetail({
  name,
  openState,
  openHours,
  distance,
  walkTime,
  affordableCount,
  todayReportCount,
  actions,
  className,
}: HeaderStoreDetailProps) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-2", className)}>
      <div className="flex w-full items-center justify-between">
        <p className="w-57 max-w-57 truncate text-title-20-bold text-content-primary">{name}</p>
        <div className="flex shrink-0 items-center justify-end gap-3">{actions}</div>
      </div>
      <div className="flex w-full flex-col items-start gap-3">
        <div className="flex flex-col items-start gap-1">
          <div className="flex w-full items-center gap-1.5">
            <p className="text-body-14-semibold text-content-primary">{openState}</p>
            <span
              aria-hidden="true"
              className="size-0.5 shrink-0 rounded-full bg-current text-content-secondary"
            />
            <p className="text-body-14-regular text-content-secondary">{openHours}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-body-14-semibold text-content-primary">{distance}</p>
            <span
              aria-hidden="true"
              className="size-0.5 shrink-0 rounded-full bg-current text-content-secondary"
            />
            <p className="text-body-14-regular text-content-secondary">{walkTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BadgeStoreStat metric="affordable" count={affordableCount} />
          <BadgeStoreStat metric="today-report" count={todayReportCount} />
        </div>
      </div>
    </div>
  );
}
