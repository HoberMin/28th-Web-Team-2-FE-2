"use client";

import { Button } from "@/app/_components/button";

// F04-1 야채 제보 — getReportVegetable(getItemDetail)의 401/403/404/400은 이미 undefined로
// 삼켜져 폼이 "선택해 주세요" 상태로 남는다(`_data.ts`). 여기서 잡는 건 그 외(네트워크·5xx 등)
// 뿐이라 Figma에 이 상태가 없어 `(tabs)/prices/error.tsx`와 같은 문구·버튼 패턴을 따랐다.
export default function ReportError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col items-center justify-center gap-2 bg-surface-primary px-4 text-center">
        <p className="text-title-18-bold text-content-primary">제보 폼을 불러오지 못했어요</p>
        <p className="text-body-14-regular text-content-secondary">잠시 뒤에 다시 시도해 주세요.</p>
        <Button
          className="mt-2"
          variant="secondary"
          size="small"
          leading={false}
          trailing={false}
          onClick={reset}
        >
          다시 시도
        </Button>
      </div>
    </main>
  );
}
