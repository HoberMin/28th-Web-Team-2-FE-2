import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `marker/store-map` — Design Library node 439-7518 · 축소 화면 instance 786-11335
// (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-12.
// 지도 위에 얹는 가게 마커. 기본 type(name·favorite·icon)에 축소 지도용 compact와
// 여러 가게가 겹쳤을 때의 count 배지를 추가한다.
//
// get_design_context 실측 — 세 type의 공통분모:
//   border-2 border-solid · flex items-center justify-center · radius/full
//
// type별로 갈리는 값:
//   icon      bg content/brand/light(#05a163=green-600) · border surface/primary(흰색)
//             p-[10px] size-[48px] → p-2.5 size-12
//             안에 icon/store-fill 글리프 하나 (Figma 실측 20.4×18.9)
//   name      bg surface/primary(흰색) · border content/brand/light(#05a163)
//             gap-[4px] px-[12px] py-[6px] max-w-[168px] → gap-1 px-3 py-1.5 max-w-42
//             텍스트 body/14-semibold · content/primary · 한 줄 말줄임
//             drop-shadow 0px 0px 3.273px rgba(74,86,103,0.22)
//   favorite  name과 **완전히 같고** 텍스트 앞에 icon/heart-fill 16×16이 하나 더 붙는다.
//   compact   bg content/brand/light · border surface/primary 1px · p-2 · size-8
//   count     compact 위에 gap-0.5로 배치. 흰 배경 · 초록 2px 테두리 · px-2 py-0.5 ·
//             caption/10-bold 초록 텍스트. 자릿수(2·44·359)에 따라 배지 폭이 자연히 늘어난다.
//
// 그림자: Figma 값 rgba(74,86,103,0.22)는 raw 팔레트의 gray/700 22%와 정확히 같고,
//   이미 `--shadow-floating`(0px 0px 3px, button/circle에서 sync)이 같은 색·같은 형태로 있다.
//   블러 반경만 3.273px vs 3px로 다른데, 0.273px 차이는 Figma가 마커 프레임을 스케일해서 생긴
//   반올림 흔적으로 보인다. 새 토큰을 만드는 대신 기존 `shadow-floating`을 재사용했다.
//   (Figma는 drop-shadow 필터, 여기선 box-shadow — 알약 모양이라 결과는 같다.)
//
// 가게 핀과 하트의 컨텍스트별 원본은 public에 export했다. `icon` 슬롯은 currentColor를 쓰는
// SVG도 받을 수 있고, type=icon일 때는 이 컴포넌트가 글자색을 흰색으로 잡아 준다.
//
// ⚠️ 대비 계산:
//      icon  흰 글리프 on content/brand/light(#05a163)  = 3.34:1 → 아이콘 기준 3:1 통과
//      icon  흰 테두리 on 초록 배경                      = 3.34:1 → 통과 (지도 위 식별용 경계)
//      name/favorite  테두리 #05a163 on 흰 배경          = 3.34:1 → UI 컴포넌트 3:1 통과
//      name/favorite  텍스트 content/primary on 흰 배경  = 13.51:1 → 통과
//      count 텍스트 content/brand/light on 흰 배경        = 3.34:1 → 10px 텍스트 4.5:1 미달
//    기본 3종은 기준을 넘는다. count만 Figma 원본 대비가 미달이며, 임의로 색을 바꾸지 않고
//    원본 유지 + 사실을 기록한다.
//
// ⚠️ count가 쓰는 `caption/10-bold`는 Typography 파운데이션(node 171-3737)의 21종에는 없다.
//    존재하지 않는 전역 토큰을 만들지 않고 이 컴포넌트 안에서 Figma 실측 10/1.45/-2%/700을 쓴다.
//
// ⚠️ 프레젠테이션 전용이다. 지도 마커는 보통 눌러서 가게를 여는 대상이지만 Figma 심볼에
//    버튼 정의가 없어 <button>으로 만들지 않았다. 누를 수 있게 쓸 때는 호출부가 감싼다.

export type MarkerStoreMapType = "name" | "favorite" | "icon";
export type MarkerStoreMapSize = "regular" | "compact";

const PILL =
  "bg-surface-primary border-content-brand-light shadow-floating gap-1 px-3 py-1.5 max-w-42";

export interface MarkerStoreMapProps {
  type?: MarkerStoreMapType;
  /** 축소 지도에서는 32px compact 마커를 쓴다. name/favorite는 regular만 지원한다. */
  size?: MarkerStoreMapSize;
  /** 겹친 가게 수. 2 이상이면 Figma의 count 배지를 compact 마커 위에 표시한다. */
  count?: number;
  /**
   * 가게 이름. type이 `name`·`favorite`일 때 쓴다.
   * type=`icon`에서는 화면에 글자가 없으므로 스크린리더용 이름으로 쓰인다.
   */
  label: string;
  /**
   * 아이콘 슬롯. type=`icon`이면 가게 핀(icon/store-fill),
   * type=`favorite`면 이름 앞에 붙는 하트(icon/heart-fill 16×16).
   * type=`name`에서는 쓰이지 않는다.
   */
  icon?: ReactNode;
  className?: string;
}

export function MarkerStoreMap({
  type = "icon",
  size = "regular",
  count,
  label,
  icon,
  className,
}: MarkerStoreMapProps) {
  if (type === "icon") {
    if (size === "compact") {
      const marker = (
        <div
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-surface-primary bg-content-brand-light p-2 text-white",
            className,
          )}
        >
          <span
            aria-hidden="true"
            className="flex size-4 items-center justify-center [&>img]:h-3 [&>img]:w-[13px]"
          >
            {icon}
          </span>
          <span className="sr-only">{label}</span>
        </div>
      );

      return count && count > 1 ? (
        <div className="inline-flex flex-col items-center gap-0.5">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center rounded-full border-2 border-content-brand-light bg-surface-primary px-2 py-0.5 text-[10px] leading-[1.45] font-bold tracking-[-0.02em] whitespace-nowrap text-content-brand-light"
          >
            {count}
          </span>
          {marker}
          <span className="sr-only">가게 {count}곳</span>
        </div>
      ) : (
        marker
      );
    }

    return (
      <div
        className={cn(
          "inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-surface-primary bg-content-brand-light p-2.5 text-white",
          className,
        )}
      >
        <span aria-hidden="true" className="flex size-full items-center justify-center">
          {icon}
        </span>
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2",
        PILL,
        className,
      )}
    >
      {type === "favorite" ? (
        <span
          aria-hidden="true"
          className="flex size-4 shrink-0 items-center justify-center text-content-brand-light"
        >
          {icon}
        </span>
      ) : null}
      <p className="min-w-0 flex-1 truncate text-center text-body-14-semibold text-content-primary">
        {label}
      </p>
      {type === "favorite" ? <span className="sr-only">찜한 가게</span> : null}
    </div>
  );
}
