import { LoadingCircular } from "@/app/_components/loading-circular";

// F04-3 판매 장소 선택 — 카카오 검색 fetch가 걸리는 동안의 로딩. 실패는 화면이 깨지지 않게
// `searchNearbyStorePlaces` 내부에서 더미로 폴백하도록 설계돼 있어 별도 error.tsx가 없다
// (`app/report/place/page.tsx` 머리말 참고).
export default function ReportPlaceLoading() {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 items-center justify-center bg-surface-primary">
        <LoadingCircular animate label="근처 가게를 찾고 있어요" />
      </div>
    </main>
  );
}
