"use client";

import Link from "next/link";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";

// 제보하기 CTA → 바텀시트(촬영 / 직접 입력) — Figma F03 연결선 그대로.
export function ReportSheet({ vegetableId }: { vegetableId: string }) {
  return (
    <BottomSheetRoot>
      <BottomSheetTrigger asChild>
        {/* seed 토큰으로 통일 — Figma는 gray/900이고 seed의 neutral-solid가 같은 역할이다.
            hex를 박으면 다크모드·토큰 변경에 따라가지 못한다 */}
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center rounded-xl bg-bg-neutral-solid text-body-18-semibold text-fg-neutral-inverted"
        >
          오프라인 가격 제보하기
        </button>
      </BottomSheetTrigger>
      <BottomSheetContent title="어떻게 제보할까요?">
        <BottomSheetBody className="flex flex-col gap-2 pb-2">
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/report/location?item=${vegetableId}&method=photo`}>야채 촬영하기</Link>
          </ActionButton>
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/report/location?item=${vegetableId}&method=manual`}>직접 입력하기</Link>
          </ActionButton>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
