"use client";

import { ActionButton } from "seed-design/ui/action-button";
import { PhoneFrame } from "./_lib/shell";

// 프로토타입 공통 에러 화면.
// 카피 규칙: 무엇이 안 됐는지 + 지금 할 수 있는 것만 말한다. 사과문·기술 용어는 넣지 않는다.
// (시세 조회는 KAMIS 실패 시 더미로 폴백하므로 여기까지 오는 건 예상 밖 오류다)
export default function PrototypeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-head2-18 text-fg-neutral">시세를 불러오지 못했어요</p>
          <p className="text-body-14-regular text-fg-neutral-subtle">
            잠시 후 다시 시도해 주세요. 계속 안 되면 네트워크 연결을 확인해 주세요.
          </p>
        </div>
        <ActionButton type="button" variant="neutralSolid" size="medium" onClick={reset}>
          다시 시도
        </ActionButton>
      </div>
    </PhoneFrame>
  );
}
