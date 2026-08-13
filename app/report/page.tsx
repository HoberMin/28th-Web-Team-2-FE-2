import Link from "next/link";
import type { Metadata } from "next";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "./_components/report-header";
import { getReportPlace, getReportVegetable } from "./_data";
import { ReportForm } from "./_report-form";

// ── 실측 출처 (검산용) ─────────────────────────────────────────────────────────
// 이 폴더의 모든 `364:xxxx` 노드 ID는 **장보고 Design 파일**의 것이다:
//   fileKey  d5j7K9BNpSXxVUu3fmZfY4
//   섹션     `화면GUI(원본)` = 364:6742 (페이지 `(공유) GUI` = 0:1, 이 페이지의 유일한 섹션)
// ⚠️ 레포의 다른 주석들이 참조하는 `WfW1Nkx1oiOWBHNwrw48IL`는 **Design Library**(컴포넌트·토큰)라
//    거기서는 이 ID들이 해석되지 않는다. 두 파일을 섞어 보면 검산이 어긋난다.
//    (실제로 리뷰에서 이 혼동이 발생해 fileKey를 명시하게 됐다)

// F04-1 야채 제보 — Figma 화면GUI(원본) 364:8145 · 8173 · 8201 · 8236 · 8265.
//
// **Server Component다.** 클라이언트 지시어는 `_report-form.tsx`(입력·사진·모달) 하나뿐이다.
//
// 선택값(품목·장소)은 **쿼리 파라미터로 물고 다닌다** — F04-2·F04-3으로 나갔다 돌아와도 입력이
// 날아가지 않아야 하고, 그 상태를 URL이 들고 있으면 서버에서 그려 낼 수 있어 클라 상태가 줄어든다.
// (전역 상태 도구는 아직 미정 — `conventions.md` TODO)
//
// GNB는 렌더하지 않는다 — 제보 흐름은 `(tabs)` 그룹 바깥의 풀스크린이다(`routes.ts` 주석 참고).
// Figma도 제보 12프레임 전부에 nav/gnb가 없다.

export const metadata: Metadata = {
  title: "야채 제보 | 장보고",
};

interface ReportPageProps {
  searchParams: Promise<{ item?: string; place?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { item, place } = await searchParams;
  const vegetable = getReportVegetable(item);
  const selectedPlace = getReportPlace(place);

  // 품목·장소 화면으로 나갈 때 현재 선택을 함께 넘긴다.
  const carry = new URLSearchParams();
  if (item) carry.set("item", item);
  if (place) carry.set("place", place);
  const carryQuery = carry.size > 0 ? `?${carry.toString()}` : "";

  return (
    <main className="min-h-dvh bg-surface-secondary">
      <div className="mx-auto flex h-dvh w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <ReportHeader
          title="야채 제보"
          leading={
            // Figma 개발 주석에 이동 대상이 없다. 제보는 시세 상세에서 진입하는 흐름이라
            // 뒤로가기는 브라우저 히스토리가 맞지만, Server Component에서 history를 만질 수 없어
            // 시세 목록으로 보낸다. 진입 경로가 확정되면 여기만 바꾸면 된다.
            <Link
              href={ROUTES.prices}
              aria-label="뒤로"
              className="flex size-12 items-center justify-center"
            >
              <FigmaIcon name="chevron-left" width={24} />
            </Link>
          }
        />

        <ReportForm
          vegetableName={vegetable?.name}
          unitType={vegetable?.unitType}
          placeName={selectedPlace?.name}
          carryQuery={carryQuery}
        />
      </div>
    </main>
  );
}
