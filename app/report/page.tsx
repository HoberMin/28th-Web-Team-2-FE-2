import Link from "next/link";
import type { Metadata } from "next";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { ReportHeader } from "./_components/report-header";
import { getReportVegetable, parseCarriedStore } from "./_data";
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
  searchParams: Promise<{ item?: string; store?: string }>;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { item, store } = await searchParams;
  const parsedItemId = item ? Number(item) : NaN;
  const itemId = Number.isSafeInteger(parsedItemId) ? parsedItemId : undefined;
  const selectedStore = parseCarriedStore(store);

  // itemId가 있어도 regionId가 없으면 조회할 수 없다 — 이 화면은 그런 경우에도 폼 자체는
  // 보여준다(FieldSelect가 "선택해 주세요"로 남는다). regionId가 진짜 필요한 지점은
  // 제출(Server Action)이고, 거기서 막힌다.
  const [token, regionId] = await Promise.all([getAccessToken(), getSelectedRegionId()]);
  const vegetable =
    itemId !== undefined && regionId
      ? await getReportVegetable({ itemId, regionId, token })
      : undefined;

  // 품목·장소 화면으로 나갈 때 현재 선택을 함께 넘긴다.
  const carry = new URLSearchParams();
  if (item) carry.set("item", item);
  if (store) carry.set("store", store);
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
          // 품목을 바꾸면 기본 단위도 새 품목 기준으로 초기화한다. 같은 품목으로
          // 품목·장소 화면을 다녀올 때는 폼 상태(선택 단위 포함)를 유지한다.
          key={itemId ?? "empty-item"}
          // vegetable 조회가 실패하면(품목이 없어졌거나 regionId 없음) itemId도 함께 비워
          // "선택해 주세요" 상태로 일관되게 남긴다 — 이름만 있고 id가 없는 상태를 만들지 않는다.
          itemId={vegetable ? itemId : undefined}
          vegetableName={vegetable?.name}
          unitType={vegetable?.unit ?? undefined}
          store={selectedStore}
          placeName={selectedStore?.placeName}
          carryQuery={carryQuery}
        />
      </div>
    </main>
  );
}
