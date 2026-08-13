import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

// Figma `report-form-photo-dropzone` — 화면GUI(원본) 364:8152, sync 2026-08-13.
//
// get_design_context 실측:
//   루트   bg surface/secondary · radius/**md**(8) · flex flex-col gap-[12px] items-start
//          justify-center · px-[12px] py-[16px] · w-full
//          → 높이 hug: 16 + 44(hint) + 12 + 38(버튼) + 16 = **126px** (XML 실측과 일치)
//   hint   flex gap-[8px] items-start · w-[235px]
//     아이콘  24×24 (별 2개 — 자동 입력을 암시하는 sparkle)
//     문구    2줄 · 기본 body/14-medium · content/secondary
//             1줄: "야채, 영수증 사진"(body/14-semibold · **#05a163** = content/brand/light) + "을 추가하면 "
//             2줄: "품목과 가격"(body/14-semibold · **#262f3c** = content/primary) + "을 자동으로 입력해 드려요"
//   버튼   px-[20px] py-[8px] gap-[4px] radius/md · body/14-semibold → 우리 `Button size="small"`과
//          패딩·radius·타이포가 **정확히 일치**한다. 그래서 새로 만들지 않고 슬롯으로 받는다.
//
// ⚠️ **sparkle 아이콘(364:8154) 에셋이 레포에 없다.** 24×24 슬롯 안에 별 2개가 들어가는 벡터
//    (leaf 14.897 at 1.69,7.27 / 10.35 at 11.86,1.65)인데 export본을 받지 못했다.
//    figma-bridge §0-0에 따라 REST·curl로 우회하지 않았다 — 디자이너 export 대기.
//    지금은 **24×24 자리만 정확히 비워 둔다**(레이아웃은 시안과 동일, 그림만 없음).
//    받으면 `public/figma/design-library/icons/`에 넣고 `icon` prop으로 넘기면 끝난다.
//
// ⚠️ 문구 안 강조색이 raw hex다 — `#05a163`·`#262f3c`. 값은 각각 `content/brand/light`·
//    `content/primary`와 같아서 토큰으로 옮겼다(변수 바인딩만 안 돼 있는 상태).
//
// 대비: content/secondary 4.79:1 · content/brand/light 3.95:1(14px 기준 4.5:1 **미달**) ·
//       content/primary 13.51:1. 미달분은 Figma 원본 값이라 그대로 두고 기록만 한다.
//       ※ 이 미달값은 `surface/secondary`(#f2f3f8) 배경 기준으로 다시 재면 더 낮아진다.

export interface PhotoDropzoneProps {
  /**
   * 24×24 sparkle 아이콘. **아직 에셋이 없어 기본값은 빈 자리다.**
   * 위 ⚠️ 참고 — export를 받으면 여기로 넘긴다.
   */
  icon?: ReactNode;
  /** 사진을 고르는 버튼. `<Button size="small" className="w-full">` 형태를 기대한다. */
  action: ReactNode;
  className?: string;
}

export function PhotoDropzone({ icon, action, className }: PhotoDropzoneProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start justify-center gap-3 rounded-md bg-surface-secondary px-3 py-4",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        {/* 24×24 고정 — 에셋이 없어도 시안 여백이 흔들리지 않게 자리를 유지한다. */}
        <span className="block size-6 shrink-0">{icon}</span>
        <p className="text-body-14-medium text-content-secondary">
          <span className="text-body-14-semibold text-content-brand-light">야채, 영수증 사진</span>
          을 추가하면
          <br />
          <span className="text-body-14-semibold text-content-primary">품목과 가격</span>을 자동으로
          입력해 드려요
        </p>
      </div>
      {action}
    </div>
  );
}
