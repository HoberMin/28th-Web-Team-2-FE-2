import { ProgressCircle } from "seed-design/ui/progress-circle";
import { PhoneFrame } from "./_lib/shell";

// 프로토타입 공통 로딩 — 서버에서 46종 기준선(KAMIS)을 조립하는 동안 보인다.
// 폰 프레임을 유지해 로딩→본문 전환에서 레이아웃이 튀지 않게 한다.
// 스피너는 ProgressCircle을 쓴다 — LoadingIndicator는 ActionButton의 pending 상태 전용이라
// 단독으로 쓰면 컨텍스트가 없어 렌더가 실패한다.
export default function PrototypeLoading() {
  return (
    <PhoneFrame>
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center gap-3 text-fg-neutral-muted"
      >
        <ProgressCircle size="40" tone="brand" />
        <p className="text-body-14-regular">오늘 시세를 불러오고 있어요</p>
      </div>
    </PhoneFrame>
  );
}
