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
          {/* 가게 위치 선택은 별도 화면이 아니라 제보 폼 안의 drawer다 → 촬영·직접입력 모두 목적지로 직행 */}
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/capture?item=${vegetableId}&method=photo`}>야채 촬영하기</Link>
          </ActionButton>
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/report?item=${vegetableId}&method=manual`}>직접 입력하기</Link>
          </ActionButton>
          {/* 즉석 판단 최단 경로 — 상단 CalloutLink를 없앤 대신 여기로 통합(F03 백로그 #7).
              제보 없이 "이 가격 괜찮은지"만 확인하고 싶을 때. */}
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/judge?item=${vegetableId}`}>가격만 확인하기</Link>
          </ActionButton>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
