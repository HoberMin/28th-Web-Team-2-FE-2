"use client";

import { Button } from "../../_components/button";

export default function PricesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-20 pb-20 text-center">
      <p className="text-title-18-bold text-content-primary">야채 시세를 불러오지 못했어요</p>
      <p className="text-body-14-regular text-content-secondary">
        잠시 뒤에 다시 시도해 주세요.
      </p>
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
  );
}
