import type { ReactNode } from "react";
import { cn } from "../_lib/cn";

// Figma `marker/store-map` — Design Library node 439-7518 (fileKey WfW1Nkx1oiOWBHNwrw48IL), sync 2026-08-08.
// 신규 컴포넌트. Variant 축은 `type`(name·favorite·icon) 하나 — 심볼 3개
// (439-7489 name · 439-7509 favorite · 439-7490 icon). 지도 위에 얹는 가게 마커다.
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
//
// 그림자: Figma 값 rgba(74,86,103,0.22)는 raw 팔레트의 gray/700 22%와 정확히 같고,
//   이미 `--shadow-floating`(0px 0px 3px, button/circle에서 sync)이 같은 색·같은 형태로 있다.
//   블러 반경만 3.273px vs 3px로 다른데, 0.273px 차이는 Figma가 마커 프레임을 스케일해서 생긴
//   반올림 흔적으로 보인다. 새 토큰을 만드는 대신 기존 `shadow-floating`을 재사용했다.
//   (Figma는 drop-shadow 필터, 여기선 box-shadow — 알약 모양이라 결과는 같다.)
//
// ⚠️ 가게 핀(icon/store-fill 185-2134)과 하트(icon/heart-fill 338-8936)는 슬롯으로 비워 뒀다 —
//    에셋 다운로드가 정책상 차단돼 있다(figma-bridge §0-0). `icon` 슬롯은 currentColor를 쓰는
//    SVG를 넘겨받는다고 가정하고, type=icon일 때는 이 컴포넌트가 글자색을 흰색으로 잡아 준다.
//
// ⚠️ 대비 계산:
//      icon  흰 글리프 on content/brand/light(#05a163)  = 3.34:1 → 아이콘 기준 3:1 통과
//      icon  흰 테두리 on 초록 배경                      = 3.34:1 → 통과 (지도 위 식별용 경계)
//      name/favorite  테두리 #05a163 on 흰 배경          = 3.34:1 → UI 컴포넌트 3:1 통과
//      name/favorite  텍스트 content/primary on 흰 배경  = 13.51:1 → 통과
//    셋 다 기준을 넘는다.
//
// ⚠️ 프레젠테이션 전용이다. 지도 마커는 보통 눌러서 가게를 여는 대상이지만 Figma 심볼에
//    버튼 정의가 없어 <button>으로 만들지 않았다. 누를 수 있게 쓸 때는 호출부가 감싼다.

export type MarkerStoreMapType = "name" | "favorite" | "icon";

const PILL =
  "bg-surface-primary border-content-brand-light shadow-floating gap-1 px-3 py-1.5 max-w-42";

export interface MarkerStoreMapProps {
  type?: MarkerStoreMapType;
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

export function MarkerStoreMap({ type = "icon", label, icon, className }: MarkerStoreMapProps) {
  if (type === "icon") {
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
