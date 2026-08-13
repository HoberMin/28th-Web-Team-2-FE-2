import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

// Figma `report-form-photo-preview` — 화면GUI(원본) 364:8243, sync 2026-08-13.
// 사진을 등록한 뒤 dropzone 자리를 대체한다(F04-1 364:8236 · 8265).
//
// get_design_context 실측:
//   루트        flex flex-col items-start · **w-[124px]** · relative
//   image-frame aspect-square · radius/**lg**(12) · bg white · overflow-clip · w-full → 124×124
//   remove      absolute **left-[94px] top-[-18px]** · 48×48 슬롯 · 안쪽 24×24 원형 버튼(가운데)
//               → 24px 버튼의 중심이 (118, 6) — 사진 우상단 모서리에 걸쳐 **밖으로 튀어나온다**
//
// ⚠️ 삭제 버튼이 부모 밖으로 나간다(top -18). 시안 의도로 보이지만 확인이 필요하다 —
//    `report-form-fields`가 gap-40으로 넉넉해서 위 요소를 가리지는 않는다.
//    (GUI피드백.md에 기록)
//
// ⚠️ 48×48 슬롯은 **터치 타겟**이고 눈에 보이는 원은 24px다. 24px 단독이면 최소 44px 기준에
//    한참 못 미치는데 Figma가 48 슬롯을 둬서 해결해 놨다 — 그 구조를 그대로 옮겼다.
//
// ⚠️ 원형 배경(364:6721 `circle-bg`) SVG를 받지 못했다. 실측이 "24px 원 + 안쪽 16px icon/close"라
//    레포 `close.svg`로 조립했고 원 배경은 `surface/inverse`로 뒀다 — 사진 위에 얹히는 버튼이라
//    어두운 반투명이어야 글리프가 보인다. **추정값이므로 디자이너 확인이 필요하다**
//    (figma-bridge §4 — 임의 hex를 만들지 않고 기존 토큰 중 역할이 맞는 것을 골랐다).
//    (GUI피드백.md에 기록)
//
// 이미지 자체는 Figma가 프레임보다 크게 잘라 놨다(-3.65, -8.04에 133.957×134.701) — 그건 샘플
// 사진의 크롭 사정이라 옮기지 않고 `object-cover`로 대체한다.

export interface PhotoPreviewProps {
  /** 124×124 안에 채울 사진. `object-cover`를 붙인 이미지를 기대한다. */
  children: ReactNode;
  /** 삭제 버튼. 24×24 원형을 기대한다 — 48×48 터치 슬롯은 이 컴포넌트가 만든다. */
  removeButton: ReactNode;
  className?: string;
}

export function PhotoPreview({ children, removeButton, className }: PhotoPreviewProps) {
  return (
    <div className={cn("relative flex w-31 flex-col items-start", className)}>
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-surface-primary">
        {children}
      </div>
      {/* 48×48 터치 슬롯. Figma left-94 / top-−18 그대로 — 24px 원이 우상단에 걸친다. */}
      <div className="absolute -top-4.5 left-23.5 flex size-12 items-center justify-center">
        {removeButton}
      </div>
    </div>
  );
}
