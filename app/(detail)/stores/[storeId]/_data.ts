// F03-3 가게 상세의 입력 정리.
//
// 가게 이름·주소·영업시간은 `GET /api/v1/stores/{storeId}`(2026-08-21 신설)가 진실 소스다.
// 여기 있는 쿼리 파싱은 **그 조회가 실패하거나 필드가 빈 경우의 폴백**이다 — 직전 화면
// (지도 시트 · 찜 「가게」 탭)이 실어 보낸 값을 쓰고, 둘 다 없으면 그 줄을 비운다
// (예시 데이터로 채우지 않는다).
//
// 쿼리는 URL에서 오므로 사용자가 조작할 수 있다. 길이·형식을 zod로 거르고, 화면은 문자열만
// 그린다(주소·전화번호를 링크로 만들지 않는다).

import { z } from "zod";
import type { StoreReport } from "@/app/_lib/api/schemas/stores";

export interface StoreDetailPrice {
  id: string;
  name: string;
  /** 예: "오늘" · "3일 전" */
  age: string;
  /** 예: "24,900원" */
  price: string;
  /** 예: "/1kg" */
  unit: string;
  /** 예: "▼ 1,000원(-7.4%)". 공공 시세 대비 차이가 없으면 빈 문자열. */
  trend: string;
  kind: "cheap" | "expensive";
  /** 응답의 `itemImageUrl`. 없으면 화면이 품목명으로 Figma 벡터를 찾는다. */
  imageUrl?: string;
}

/** 직전 화면이 실어 보낸 가게 프로필. 전부 optional이다 — 없으면 화면이 그 줄을 뺀다. */
export interface StoreDetailProfile {
  name?: string;
  address?: string;
  phone?: string;
  /** 오늘 영업시간 문구. `favorite-stores`의 `todayBusinessHours`가 그대로 들어온다. */
  hours?: string;
  /** 영업 상태 문구. 예: "영업중" */
  openLabel?: string;
  imageUrl?: string;
  liked: boolean;
}

type StoreDetailSearchParams = Record<string, string | string[] | undefined>;

const profileQuerySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  address: z.string().trim().min(1).max(255).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  hours: z.string().trim().min(1).max(255).optional(),
  openLabel: z.string().trim().min(1).max(30).optional(),
  /** http(s) 절대 URL만 받는다 — `javascript:` 같은 스킴이 <img src>로 들어가지 않게. */
  imageUrl: z.url().max(500).startsWith("http").optional(),
  liked: z.literal(["1", "0"]).optional(),
});

function firstQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseStoreDetailProfile(params: StoreDetailSearchParams): StoreDetailProfile {
  const parsed = profileQuerySchema.safeParse({
    name: firstQueryValue(params.name),
    address: firstQueryValue(params.address),
    phone: firstQueryValue(params.phone),
    hours: firstQueryValue(params.hours),
    openLabel: firstQueryValue(params.openLabel),
    imageUrl: firstQueryValue(params.imageUrl),
    liked: firstQueryValue(params.liked),
  });
  // safeParse가 실패하면 조작된 쿼리다 — 통째로 버리고 빈 프로필로 그린다.
  const query = parsed.success ? parsed.data : {};

  return {
    name: query.name,
    address: query.address,
    phone: query.phone,
    hours: query.hours,
    openLabel: query.openLabel,
    imageUrl: query.imageUrl,
    liked: query.liked === "1",
  };
}

/** 라우트 파라미터는 Spring의 숫자 storeId다. 아니면 404. */
export function parseStoreId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const storeId = Number(value);
  return Number.isSafeInteger(storeId) && storeId > 0 ? storeId : null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * "오늘"의 기준 시각. **RSC 본문에서 `Date.now()`를 직접 부르지 않는다** —
 * react-hooks/purity 린트가 컴포넌트 안의 불순 호출을 막고, 실제로도 라우트가 캐시되면
 * "오늘"이 굳는다. 이 라우트는 개인화 여부와 무관하게 요청마다 새로 계산돼야 한다.
 */
export function reportAgeBaseline(): number {
  return Date.now();
}

/**
 * `reportedDate`("2026-08-18")를 "오늘"·"3일 전"으로 바꾼다.
 *
 * 기준 시각을 **인자로 받는다** — RSC에서 `Date.now()`를 직접 부르면 그 라우트가 캐시되는
 * 동안 "오늘"이 굳는다. 호출부가 렌더 시점 값을 넘겨 의도를 드러내게 한다.
 */
export function formatReportAge(reportedDate: string | null | undefined, now: number): string {
  if (!reportedDate) return "";
  const parsedDate = Date.parse(`${reportedDate}T00:00:00+09:00`);
  if (Number.isNaN(parsedDate)) return "";

  const todayStart = Date.parse(
    `${new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)}T00:00:00+09:00`,
  );
  const days = Math.round((todayStart - parsedDate) / DAY_MS);

  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}

/** 공공 시세 대비 차이 문구. 차액·비율 중 있는 것만 조합한다. */
function formatTrend(report: StoreReport): string {
  const diff = report.publicPriceDiff;
  const rate = report.priceDiffRate;
  if (typeof diff !== "number" || diff === 0) return "";

  const arrow = diff < 0 ? "▼" : "▲";
  const amount = `${Math.abs(diff).toLocaleString("ko-KR")}원`;
  if (typeof rate !== "number" || !Number.isFinite(rate)) return `${arrow} ${amount}`;

  const sign = rate < 0 ? "-" : "+";
  return `${arrow} ${amount}(${sign}${Math.abs(rate).toFixed(1)}%)`;
}

/**
 * 제보 DTO → 화면 행.
 *
 * `priceClassification`이 EQUAL인 제보는 저렴/비쌈 어느 쪽도 아니라 `null`로 걸러낸다 —
 * 화면 토글이 두 값뿐이라 EQUAL을 억지로 한쪽에 넣으면 숫자가 틀어진다.
 */
export function mapStoreReportToPrice(report: StoreReport, now: number): StoreDetailPrice | null {
  if (report.priceClassification === "EQUAL") return null;

  return {
    id: String(report.reportId),
    name: report.itemName,
    age: formatReportAge(report.reportedDate, now),
    price: `${report.price.toLocaleString("ko-KR")}원`,
    unit: report.unit ? `/${report.unit}` : "",
    trend: formatTrend(report),
    kind: report.priceClassification === "CHEAP" ? "cheap" : "expensive",
    imageUrl: report.itemImageUrl?.trim() || undefined,
  };
}
