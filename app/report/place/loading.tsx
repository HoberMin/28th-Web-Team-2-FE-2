import { LoadingCircular } from "@/app/_components/loading-circular";

// F04-3 판매 장소 선택 — 선택 지역 해석과 카카오 검색이 걸리는 동안의 로딩.
// 검색 실패는 page.tsx에서 가짜 가게 대신 목록 상태 문구로 전환한다.
export default function ReportPlaceLoading() {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 items-center justify-center bg-surface-primary">
        <LoadingCircular animate label="근처 가게를 찾고 있어요" />
      </div>
    </main>
  );
}
