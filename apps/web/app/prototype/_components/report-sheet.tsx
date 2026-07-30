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
        {/* 손으로 만든 버튼 → seed ActionButton. 이전엔 이 화면만 h-14 rounded-xl 이라
            같은 자리(하단 CTA)의 버튼이 화면마다 높이·모서리가 달랐다.
            정품으로 바꾸면 pressed·focus·disabled 상태도 같이 따라온다. */}
        <ActionButton type="button" variant="neutralSolid" size="large" className="w-full">
          오프라인 가격 제보하기
        </ActionButton>
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
