import "server-only";

import {
  myReportPageEnvelopeSchema,
  myWeeklyReportEnvelopeSchema,
  type MyReportPage,
  type MyWeeklyReport,
  type UpdateMyReport,
} from "../schemas/my-reports";
import { springFetch } from "../spring";

/**
 * 내가 작성한 가격 제보 목록 (F05-3 마이페이지).
 *
 * 본인 데이터라 `no-store`다 — 공유 캐시에 넣으면 남의 제보가 보인다(`auth-session` §5).
 * 제보가 없으면 빈 목록으로 정상 200이 온다(스펙 명시).
 */
export async function getMyReports(params: {
  token: string;
  page?: number;
  size?: number;
}): Promise<MyReportPage> {
  const { token, ...query } = params;
  const envelope = await springFetch({
    path: "/api/v1/users/me/reports",
    query: { ...query },
    token,
    schema: myReportPageEnvelopeSchema,
    cache: "no-store",
  });
  return envelope.data;
}

/**
 * 주간 제보 현황 (F05 제보 캘린더).
 *
 * 제보가 하나도 없어도 7일이 `hasReported: false`로 채워져 온다 — 화면이 빈 배열을
 * 따로 다룰 필요가 없다.
 */
export async function getMyWeeklyReports(token: string): Promise<MyWeeklyReport> {
  const envelope = await springFetch({
    path: "/api/v1/users/me/reports/weekly",
    token,
    schema: myWeeklyReportEnvelopeSchema,
    cache: "no-store",
  });
  return envelope.data;
}

/**
 * 내 제보 수정. 본문 세 값을 모두 보낸다(부분 수정이 아니다).
 *
 * 실패 분기(`ApiError.kind`): `notFound`(404, 남의 제보이거나 없음)·`badRequest`(400).
 */
export async function updateMyReport(params: {
  reportId: number;
  token: string;
  body: UpdateMyReport;
}): Promise<void> {
  await springFetch({
    path: `/api/v1/users/me/reports/${params.reportId}`,
    method: "PATCH",
    body: { ...params.body },
    token: params.token,
    cache: "no-store",
  });
}

/** 내 제보 삭제. 본문이 없다. */
export async function deleteMyReport(params: {
  reportId: number;
  token: string;
}): Promise<void> {
  await springFetch({
    path: `/api/v1/users/me/reports/${params.reportId}`,
    method: "DELETE",
    token: params.token,
    cache: "no-store",
  });
}
