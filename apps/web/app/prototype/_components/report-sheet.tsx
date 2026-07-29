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
        {/* Figma 정합: gray/900(#262f3c)·56px·radius 12·18px SemiBold — seed 기본 배경과 hex가 달라 명시 스타일 */}
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center rounded-[12px] bg-[#262f3c] text-[18px] font-semibold tracking-[-0.02em] text-white"
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
