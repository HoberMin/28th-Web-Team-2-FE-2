import { LoadingCircular } from "@/app/_components/loading-circular";

// F04-2 야채 카테고리 — 2단(야채 목록/검색 결과)만 Spring을 조회하므로 실제로 걸리는 로딩은
// 그 경로뿐이다. 라우트 세그먼트 전체를 대체하는 Next 컨벤션이라 헤더까지 함께 사라진다 —
// 그래서 화면 셸(최대폭 97.5·전체 높이)을 이 파일에서도 다시 둘러 어색하게 좁아지지 않게 한다.
export default function ReportVegetableLoading() {
  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 items-center justify-center bg-surface-primary">
        <LoadingCircular animate currentColor className="text-content-brand-light" label="야채 목록을 불러오고 있어요" />
      </div>
    </main>
  );
}
