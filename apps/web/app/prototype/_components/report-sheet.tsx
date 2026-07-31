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
      {/* 이 시트는 "제보" 전용이다 — 판단(가격이 괜찮은지 확인)은 제보가 아니라서 여기 섞지 않는다.
          예전엔 F03 백로그 #7로 상단 CalloutLink를 없애고 여기 "가격만 확인하기"로 합쳤는데,
          제보가 아닌 선택지가 "어떻게 제보할까요?" 안에 껴서 위=판단/아래=제보 구분이 무너졌다.
          판단 진입은 시세 화면 상단 CalloutLink로 되돌렸다(백로그 F10 #11, price/[item]/page.tsx). */}
      <BottomSheetContent title="어떻게 제보할까요?">
        <BottomSheetBody className="flex flex-col gap-2 pb-2">
          {/* 가게 위치 선택은 별도 화면이 아니라 제보 폼 안의 drawer다 → 촬영·직접입력 모두 목적지로 직행 */}
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/capture?item=${vegetableId}&method=photo`}>야채 촬영하기</Link>
          </ActionButton>
          <ActionButton asChild variant="neutralWeak" size="large" className="w-full">
            <Link href={`/prototype/report?item=${vegetableId}&method=manual`}>직접 입력하기</Link>
          </ActionButton>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
