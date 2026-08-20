import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getStoreReports } from "@/app/_lib/api/server/stores";
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
// 가게 프로필(이름·주소·영업시간)은 **아직 API가 없다** — 직전 화면이 쿼리로 넘긴 값을 쓰고,
// 없으면 그 줄을 비운다(`_data.ts` 머리말).

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
  return { title: profile.name ? `${profile.name} 가게 상세` : "가게 상세" };
}

export default async function StoreDetailPage({ params, searchParams }: StoreDetailPageProps) {
  const [{ storeId: rawStoreId }, rawSearchParams] = await Promise.all([params, searchParams]);
  const storeId = parseStoreId(rawStoreId);
  if (storeId === null) notFound();

  const profile = parseStoreDetailProfile(rawSearchParams);
  const token = await getAccessToken();

  // 제보 목록이 실패해도 가게 프로필은 보여 준다 — 상세로 들어온 사용자가 빈 화면을 보는
  // 것보다 낫다. 목록 자리만 "아직 제보가 없어요"로 떨어진다.
  let cheapCount = 0;
  let expensiveCount = 0;
  let prices: ReturnType<typeof mapStoreReportToPrice>[] = [];
  try {
    const reports = await getStoreReports({ storeId, filter: "ALL", page: 0, size: 50, token });
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
      cheapCount={cheapCount}
      expensiveCount={expensiveCount}
    />
  );
}
