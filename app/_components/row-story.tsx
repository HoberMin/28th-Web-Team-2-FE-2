import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `row/story` — Design Library node 186-3196 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 없음(단일 심볼). 썸네일 + 제목 한 줄 + 오른쪽 화살표로 된 소식 목록의 한 행.
// `list/story`(186-3208)가 이걸 세로로 쌓는다.
//
// get_design_context 실측:
//   루트       flex gap-[28px] items-center py-[8px]     → gap-7 py-2
//   content    flex gap-[12px] items-center w-[262px]    → gap-3 (262px는 Figma 프레임 폭이라
//                                                          컴포넌트에 고정하지 않고 flex-1로 따라간다)
//   thumbnail  48×48 · radius/md(8px)                    → size-12 rounded-md
//   제목       body/14-semibold · content/primary
//              **두 줄까지 보이고 넘치면 …로 줄어든다** → line-clamp-2
//              (Figma 코드에 `whitespace-nowrap`이 없고 overflow-hidden + text-ellipsis만 있다.
//               렌더로 확인해도 긴 제목이 실제로 2줄로 접혀 있다. 썸네일 48px = 14px×1.55 두 줄과
//               맞아떨어지는 높이다. 처음엔 한 줄 `truncate`로 옮겼다가 렌더 대조에서 잡았다.)
//   trailing   icon/chevron-right 16×16                  → size-4 슬롯
//
// ⚠️ 썸네일 이미지와 chevron 아이콘은 슬롯으로 비워 뒀다 — 둘 다 `download_assets`로만 받을 수 있는
//    에셋이고 그 경로가 레포 정책상 차단돼 있다(figma-bridge §0-0).
//
// ⚠️ chevron 색은 **정하지 않고 상속에 맡겼다**(슬롯 래퍼에 text 색 클래스를 걸지 않는다).
//    렌더를 보면 옅은 회색인데, 이 아이콘은 Variable 바인딩이 없는 SVG 에셋이라 어떤 토큰인지
//    (content/disabled인지 gray/300인지) 특정할 수 없다. 스크린샷에서 hex를 읽어 옮기는 건
//    금지돼 있어(figma-bridge §2 — 그 방식으로 과거 8건이 틀렸다) 임의로 고르지 않았다.
//    디자이너가 확정해 주면 여기에 색 클래스를 넣는다.
//
// ⚠️ 이 컴포넌트는 **프레젠테이션 전용**이다. chevron이 "누르면 이동"을 암시하지만 Figma 심볼에
//    버튼·링크 정의가 없어서 임의로 <a>·<button>으로 만들지 않았다. 실제로 누를 수 있게 쓸 때는
//    호출부가 <Link>나 <button>으로 감싸야 접근 가능한 이름·키보드 포커스가 생긴다.
//
// 대비: content/primary(#262f3c) on 흰 배경 = 13.51:1 → 통과.

export interface RowStoryProps {
  /** Figma의 48×48 썸네일 슬롯. radius/md는 이 컴포넌트가 씌운다. */
  thumbnail: ReactNode;
  /** 소식 제목. Figma와 같이 두 줄까지 보이고 넘치면 …로 줄어든다(line-clamp-2). */
  title: string;
  /** Figma의 icon/chevron-right 슬롯(16×16). 장식이라 스크린리더에서 숨긴다. */
  trailingIcon?: ReactNode;
  className?: string;
}

export function RowStory({ thumbnail, title, trailingIcon, className }: RowStoryProps) {
  return (
    <div className={cn("flex items-center gap-7 py-2", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
        >
          {thumbnail}
        </span>
        <p className="min-w-0 flex-1 line-clamp-2 text-body-14-semibold text-content-primary">
          {title}
        </p>
      </div>
      <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
        {trailingIcon}
      </span>
    </div>
  );
}
