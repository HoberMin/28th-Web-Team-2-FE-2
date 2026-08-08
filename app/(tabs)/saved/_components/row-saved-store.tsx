import type { ReactNode } from "react";
import { cn } from "../../../_lib/cn";

// ⚠️ **라이브러리 미승격 로컬 규격** — 디자이너 승격 후 `app/_components/`로 이동 대상.
//
// Figma `화면GUI` F04_찜_가게(298-3594)의 리스트 행(298-3598 등). 이 행은 Design Library에
// 등록된 컴포넌트가 아니다 — `search_design_system`에 결과가 없는, 화면 파일 안의 로컬 규격이다.
// design-guide §1-1("Figma에 있는 규격만 등록")에 따라 정식 공통 컴포넌트로 올리지 않고 화면
// 로컬로 둔다. **`/playground` 스토리도 만들지 않는다.**
//
// `row/recommended-store`(185-2117) 재사용은 불가로 확인됐다 — 썸네일 72×72 유무, 타이포,
// 후행 요소(하트 vs chevron), 높이(105 vs 68)가 전부 다르다.
//
// get_design_context 실측 (298-3598 · 298-3599):
//   루트      border-b border/secondary · flex gap-[16px] items-center · pr-[4px] py-[16px]
//             → gap-4 pr-1 py-4 border-b border-border-secondary
//             높이 105 = 썸네일 72 + py 16×2 + 하단선 1 → **고정하지 않고 내용에서 파생**시킨다
//   썸네일    72×72 · rounded-[radius/md] · border border/img → size-18 rounded-md border-border-img
//   info      flex-1 min-w-0 flex-col gap-[2px] → flex-1 min-w-0 gap-0.5
//     1번째 줄 flex gap-[4px] items-center
//       이름   body/16-bold · content/primary · max-w-[160px] 말줄임 → max-w-40 truncate
//       거리   body/14-medium · content/secondary
//     2번째 줄 flex gap-[5px] items-center → **gap-1(4px)로 통일**했다. 형제 줄이 4px인데 여기만
//              5px이라 어긋나 있었다(4의 배수 아님). 시각차 1px, 정렬 일관성 쪽을 택했다.
//       영업상태 body/14-medium · 영업중=content/brand/light · 영업종료=red/500
//       구분점  2×2 SVG 에셋 — 색을 특정할 수 없어 `bg-current`로 옆 텍스트 색을 따른다
//               (row/recommended-store와 같은 처리)
//       영업시간 body/14-regular · content/secondary
//   후행      48×48 하트 터치박스 (아이콘 23×23을 가운데 정렬) → size-12
//
// ⚠️ Figma의 6행 중 5행이 빈 하트(heart-stroke-regular)인데, 여기는 **찜 목록**이라 명백한
//    시안 실수다. 코드는 전부 "찜한 상태"로 렌더한다(호출부가 채워진 하트를 넘긴다).
//
// ⚠️ 썸네일 사진과 하트 아이콘은 슬롯이다 — 데이터에 따라 바뀌는 자리라 호출부가 채운다.
//    하트는 `icons/heart-fill.svg`(디자이너 export 원본)를 23px로 꽂고, 가게 사진은 대응 에셋이
//    아직 없어 자리표시를 넘긴다(`asset-slots.tsx`).
//
// ⚠️ 프레젠테이션 전용이다. 하트 자리에 Figma가 버튼을 정의해 두지 않았고 찜 해제 동작도 아직
//    없어서 <button>으로 만들지 않았다. 토글이 붙는 시점에 호출부가 감싸거나 슬롯을 버튼으로 바꾼다.
//
// ⚠️ 대비 (Figma 원본 유지 + 사실만 기록 — figma-bridge §4):
//      영업중  content/brand/light(#05a163) on 흰 배경 = 3.34:1 (14px 기준 4.5:1) → 미달
//      영업종료 red/500(#fd364d) on 흰 배경          = 3.61:1 (기준 4.5:1)       → 미달
//      가게 이름 13.51:1 · 거리/영업시간 4.79:1은 통과.
//    영업 여부를 색으로만 구분하지 않도록 문구("영업중"/"영업종료") 자체가 정보를 들고 있다.

export type SavedStoreOpenState = "open" | "closed";

export interface RowSavedStoreProps {
  /** 가게 사진 슬롯(72×72). radius/md와 테두리는 이 컴포넌트가 씌운다. */
  thumbnail?: ReactNode;
  /** 가게 이름. 길면 한 줄에서 말줄임된다. */
  name: string;
  /** 거리 문자열. 예: "0.2km" */
  distance: string;
  /** 영업 여부 — 색과 문구가 이 값으로 갈린다. */
  openState: SavedStoreOpenState;
  /** 영업 상태 문구. 예: "영업중" / "영업종료" */
  openLabel: string;
  /** 영업시간 문구. 예: "수 10:00 - 22:00" */
  hours: string;
  /** 찜 하트 아이콘 슬롯(48×48 터치박스 안 23×23 자리). 찜 목록이므로 채워진 하트를 넘긴다. */
  favoriteIcon?: ReactNode;
  className?: string;
}

export function RowSavedStore({
  thumbnail,
  name,
  distance,
  openState,
  openLabel,
  hours,
  favoriteIcon,
  className,
}: RowSavedStoreProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 border-b border-border-secondary py-4 pr-1",
        className,
      )}
    >
      <div className="size-18 shrink-0 overflow-hidden rounded-md border border-border-img">
        {thumbnail}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <div className="flex w-full items-center gap-1 whitespace-nowrap">
          <p className="max-w-40 truncate text-body-16-bold text-content-primary">{name}</p>
          <p className="shrink-0 text-body-14-medium text-content-secondary">{distance}</p>
        </div>
        <div className="flex w-full items-center gap-1">
          <p
            className={cn(
              "shrink-0 text-body-14-medium whitespace-nowrap",
              openState === "open" ? "text-content-brand-light" : "text-red-500",
            )}
          >
            {openLabel}
          </p>
          <span
            aria-hidden="true"
            className="size-0.5 shrink-0 rounded-full bg-current text-content-secondary"
          />
          <p className="min-w-0 truncate text-body-14-regular text-content-secondary">{hours}</p>
        </div>
      </div>

      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center">
        {favoriteIcon}
      </span>
      <span className="sr-only">찜한 가게</span>
    </div>
  );
}
