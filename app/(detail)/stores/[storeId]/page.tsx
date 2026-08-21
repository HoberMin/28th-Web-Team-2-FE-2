import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getStoreDetail } from "@/app/_lib/api/server/stores";
import { getStoreReportsWithTemporaryFallback } from "@/app/_lib/api/server/stores-fallback";
import { resolveStoreOpenStatus } from "@/app/_lib/store-open-status";
import {
  mapStoreReportToPrice,
  parseStoreDetailProfile,
  parseStoreId,
  reportAgeBaseline,
} from "./_data";
import { StoreDetailClient } from "./_store-detail-client";

// F03-3 가게 상세 — `GET /api/v1/stores/{storeId}/reports`.
//
// 라우트 파라미터는 **Spring의 숫자 storeId**다. 예전에는 prototype 문자열 id와 `"temporary"`를
// 받아 더미 상세를 그렸는데, 제보 목록 API가 생기면서 그 경로를 걷어냈다(2026-08-20).
//
// 가게 프로필(이름·주소·영업시간)은 2026-08-21에 `GET /api/v1/stores/{storeId}`가 생겨
// **상세에서 직접 조회한다**. 직전 화면이 넘긴 쿼리는 이제 폴백이다 — 조회가 실패하거나
// 필드가 비면 그 값을 쓰고, 둘 다 없으면 그 줄을 비운다(`_data.ts` 머리말).

interface StoreDetailPageProps {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
  searchParams,
}: StoreDetailPageProps): Promise<Metadata> {
  const profile = parseStoreDetailProfile(await searchParams);
  await params;
  // 메타데이터는 쿼리 값만 쓴다 — 제목 하나를 위해 상세를 한 번 더 호출하지 않는다.
  return { title: profile.name ? `${profile.name} 가게 상세` : "가게 상세" };
}

export default async function StoreDetailPage({ params, searchParams }: StoreDetailPageProps) {
  const [{ storeId: rawStoreId }, rawSearchParams] = await Promise.all([params, searchParams]);
  const storeId = parseStoreId(rawStoreId);
  if (storeId === null) notFound();

  const queryProfile = parseStoreDetailProfile(rawSearchParams);
  const token = await getAccessToken();

  // 상세 조회가 실패해도 화면은 그린다 — 쿼리로 받은 값이 남아 있고, 없으면 그 줄만 빈다.
  // 제보 목록과 독립이라 한쪽 실패가 다른 쪽을 가리지 않게 따로 잡는다.
  const detail = await getStoreDetail({ storeId, token }).catch((error: unknown) => {
    if (!(error instanceof ApiError)) throw error;
    if (error.kind === "notFound") notFound();
    console.error("가게 상세 조회 실패", { kind: error.kind, status: error.status, storeId });
    return null;
  });

  const profile = detail
    ? {
        name: detail.storeName || queryProfile.name,
        address: detail.address ?? queryProfile.address,
        // 전화번호는 상세 응답에 없다 — 직전 화면이 넘긴 값을 계속 쓴다.
        phone: queryProfile.phone,
        // 요일별 목록이라 첫 줄만 요약으로 쓴다. 펼침 UI가 생기면 배열째 넘긴다.
        hours: detail.businessHours[0] ?? queryProfile.hours,
        // `openStatus`는 `"OPEN"`·`"UNKNOWN"` 같은 원시값이라 그대로 그리면 안 된다
        // (실제로 라이브가 `"UNKNOWN"`을 내려 화면에 영문이 노출됐다).
        openLabel: resolveStoreOpenStatus(detail.openStatus)?.label ?? queryProfile.openLabel,
        imageUrl: detail.storeImageUrl ?? queryProfile.imageUrl,
        liked: detail.isLiked,
      }
    : queryProfile;

  // 제보 목록이 실패해도 가게 프로필은 보여 준다 — 상세로 들어온 사용자가 빈 화면을 보는
  // 것보다 낫다. 목록 자리만 "아직 제보가 없어요"로 떨어진다.
  let cheapCount = 0;
  let expensiveCount = 0;
  let prices: ReturnType<typeof mapStoreReportToPrice>[] = [];
  let reportsAreTemporary = false;
  try {
    const result = await getStoreReportsWithTemporaryFallback({
      storeId,
      filter: "ALL",
      page: 0,
      size: 50,
      token,
    });
    const { reports } = result;
    reportsAreTemporary = result.isTemporary;
    cheapCount = reports.summary.cheapCount;
    expensiveCount = reports.summary.expensiveCount;
    // 기준 시각을 한 번 고정해 넘긴다 — 행마다 다른 "오늘"이 나오지 않도록.
    const now = reportAgeBaseline();
    prices = reports.reports.map((report) => mapStoreReportToPrice(report, now));
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.kind === "notFound") notFound();
    console.error("가게 제보 조회 실패", { kind: error.kind, status: error.status, storeId });
  }

  return (
    <StoreDetailClient
      storeId={storeId}
      profile={profile}
      prices={prices.filter((price) => price !== null)}
      favoriteCount={detail?.favoriteCount ?? undefined}
      cheapCount={cheapCount}
      expensiveCount={expensiveCount}
      reportsAreTemporary={reportsAreTemporary}
    />
  );
}
