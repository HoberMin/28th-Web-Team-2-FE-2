import { LoadingCircular } from "@/app/_components/loading-circular";

// UI QA 2026-08-20 #26 — "F02에서 F03으로 전환되는 속도가 느림(F03이 안 열리는 줄 알았어요)".
//
// 이 라우트에는 `loading.tsx`가 없었다. App Router는 loading 경계가 없으면 서버 렌더가 끝날
// 때까지 **직전 화면을 그대로 붙잡고 있으므로**, 사용자가 카드를 눌러도 아무 반응이 없는 것처럼
// 보인다. 실제 서버 시간이 같아도 "안 열린다"고 느끼는 원인이 이것이다.
//
// 경계를 두면 탭 즉시 이 화면으로 바뀌어 반응이 눈에 보이고, 상세 데이터는 그 뒤에 스트리밍된다.
// (같은 이유로 `(tabs)/prices`·`report/*`에는 이미 loading이 있었다 — 이 라우트만 빠져 있었다.)
export default function PriceDetailLoading() {
  return (
    <div className="flex h-dvh justify-center bg-surface-secondary">
      <div className="flex h-full w-full max-w-97.5 flex-col items-center justify-center bg-surface-primary text-content-secondary">
        <LoadingCircular animate label="야채 시세를 불러오고 있어요" />
      </div>
    </div>
  );
}
