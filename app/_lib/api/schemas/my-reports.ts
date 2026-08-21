// GET    /api/v1/users/me/reports              — 내 제보 목록
// GET    /api/v1/users/me/reports/weekly       — 주간 제보 현황
// PATCH  /api/v1/users/me/reports/{reportId}   — 내 제보 수정
// DELETE /api/v1/users/me/reports/{reportId}   — 내 제보 삭제
//
// ⚠️ 조회 두 건은 `{ code, message, data }` envelope로 온다.
// 전부 로그인 사용자 본인 데이터라 **공유 캐시에 넣지 않는다**(`auth-session` §5).

import { z } from "zod";

export const myReportSchema = z.object({
  reportId: z.number().int().safe(),
  itemName: z.string().nullable().optional(),
  price: z.number().int().safe(),
  unit: z.string(),
  /** `YYYY-MM-DD` */
  reportedDate: z.string(),
  /** 법정동 코드 — 앞자리 0 보존을 위해 문자열이다. */
  regionId: z.string(),
  regionName: z.string().nullable().optional(),
  priceGap: z.number().int().safe().nullable().optional(),
});
export type MyReport = z.infer<typeof myReportSchema>;

export const myReportPageSchema = z.object({
  /** 제보가 없으면 빈 목록이다 — 에러가 아니다(스펙 명시). */
  reports: z.array(myReportSchema),
  page: z.number().int().safe(),
  size: z.number().int().safe(),
  totalCount: z.number().int().safe(),
  totalPages: z.number().int().safe(),
  hasNext: z.boolean(),
});
export type MyReportPage = z.infer<typeof myReportPageSchema>;

export const myReportPageEnvelopeSchema = z.object({ data: myReportPageSchema });

export const dailyReportSchema = z.object({
  /** `YYYY-MM-DD` */
  date: z.string(),
  hasReported: z.boolean(),
  itemId: z.number().int().safe().nullable().optional(),
  itemName: z.string().nullable().optional(),
});
export type DailyReport = z.infer<typeof dailyReportSchema>;

export const myWeeklyReportSchema = z.object({
  totalReportedDays: z.number().int().safe(),
  /** 제보가 없어도 7일이 `hasReported: false`로 채워져 온다(스펙 명시). */
  dailyReports: z.array(dailyReportSchema),
});
export type MyWeeklyReport = z.infer<typeof myWeeklyReportSchema>;

export const myWeeklyReportEnvelopeSchema = z.object({ data: myWeeklyReportSchema });

/** PATCH 본문. 세 값 모두 서버가 요구한다(부분 수정이 아니다). */
export const updateMyReportSchema = z.object({
  price: z.number().int().safe().positive(),
  unit: z.string().min(1),
  amount: z.number().positive(),
});
export type UpdateMyReport = z.infer<typeof updateMyReportSchema>;
