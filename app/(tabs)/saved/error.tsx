"use client";

// 에러 상태 — **Figma에 F04 에러 시안이 없다. 임시 구현이다.**
// Next의 error 경계는 계약상 클라이언트 컴포넌트여야 해서 "use client"가 붙는다
// (인터랙션 때문이 아니라 프레임워크 요구사항 — conventions #10 예외).
// 시안이 없으므로 기존 토큰·타이포만으로 문구 + 재시도 버튼까지만 만든다.

import { Button } from "../../_components/button";

export default function SavedError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-20 pb-20 text-center">
      <p className="text-title-18-bold text-content-primary">찜 목록을 불러오지 못했어요</p>
      <p className="text-body-14-regular text-content-secondary">
        잠시 뒤에 다시 시도해 주세요.
      </p>
      <Button className="mt-2" variant="secondary" size="small" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
