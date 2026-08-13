import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/app/_lib/cn";

// 실측 출처: 장보고 Design `d5j7K9BNpSXxVUu3fmZfY4` / `화면GUI(원본)` 364:6742 — 상세는 `app/report/page.tsx` 머리말.

// Figma `row/store-option` — 화면GUI(원본) 364:6734, sync 2026-08-13.
// Figma 컴포넌트 설명: "판매 장소 선택 화면에서 매장명, 거리, 주소를 보여주는 선택 행."
//
// get_design_context 실측(364:8300):
//   루트       border-b border/secondary · flex items-center · **pr-[4px]** py-[16px] · w-[358px]
//              → 높이 hug: 16 + 56 + 16 + 테두리 1 = **89px** (XML 실측과 일치)
//   content    flex flex-[1_0_0] gap-[12px] items-center min-w-px
//   thumbnail  56×56 · radius/md · border 1px **rgba(0,0,0,0.05)**(= `border/img` 토큰과 같은 값)
//   info       flex flex-col gap-[2px] flex-[1_0_0] min-w-px
//     heading  flex gap-[4px] items-center w-full
//       이름   body/16-bold   · content/primary   · max-w-[160px] · 말줄임
//       거리   body/14-medium · content/secondary
//     주소     body/14-regular · **content/primary** · 말줄임 · w-full
//
// ⚠️ 주소가 `content/primary`(진한 본문색)이고 거리가 `content/secondary`다 — 보조 정보인 주소가
//    이름과 같은 위계의 색을 쓰고 있다. Figma 원본 그대로 옮기고 사실만 기록한다(figma-bridge §4).
//    (GUI피드백.md에 기록 — 위계 의도인지 확인 필요)
//
// ⚠️ 좌우 패딩이 비대칭이다 — 왼쪽 0 / 오른쪽 4. 시트가 이미 px-16을 들고 있어 광학적으로는
//    좌 16 / 우 20이 된다. 원본 그대로 옮겼다.
//
// Figma 개발 주석(364:8300): "탭한 즉시 F04-1_야채 제보로 이동" → 행 전체를 Link로 감쌌다.
//
// 대비: 이름·주소 content/primary 13.51:1 · 거리 content/secondary 4.79:1 → 전부 통과.

export interface RowStoreOptionProps {
  /** 가게 이름. 160px를 넘으면 말줄임된다. */
  name: string;
  /** 거리 표기. 예: "0.2km" */
  distance: string;
  /** 주소 전문. 한 줄 말줄임. */
  address: string;
  /** 56×56 썸네일 슬롯. 사진이 없으면 기본 이미지를 넣는다. */
  thumbnail: ReactNode;
  /** 이 행을 골랐을 때 갈 곳. */
  href: string;
  className?: string;
}

export function RowStoreOption({
  name,
  distance,
  address,
  thumbnail,
  href,
  className,
}: RowStoreOptionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full items-center border-b border-border-secondary py-4 pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary",
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="block size-14 shrink-0 overflow-hidden rounded-md border border-border-img">
          {thumbnail}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="flex w-full items-center gap-1">
            <span className="max-w-40 truncate text-body-16-bold text-content-primary">{name}</span>
            <span className="shrink-0 whitespace-nowrap text-body-14-medium text-content-secondary">
              {distance}
            </span>
          </span>
          <span className="w-full truncate text-body-14-regular text-content-primary">
            {address}
          </span>
        </span>
      </span>
    </Link>
  );
}
