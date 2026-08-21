import "server-only";

import { ApiError } from "@/app/_lib/api/api-error";
import {
  getItemDetailWithTemporaryFallback,
  getItemsWithTemporaryFallback,
} from "@/app/_lib/api/server/items-fallback";
import { storeRequestSchema, type StoreRequest } from "@/app/_lib/api/schemas/reports";
import { PRICE_GROUPS, mapGroupToApi, normalizeGroup } from "@/app/(tabs)/prices/_query";
import type { VegetableGroup } from "@/app/_lib/types";

// F04-1~4 제보 플로우 화면 데이터 — Figma 화면GUI(원본) 364:8063~8317.
//
// 품목·장소 모두 실 Spring/카카오 연동으로 바뀌었다(더미 46종 카탈로그는 F04에서는 더 이상
// 쓰지 않는다). 카테고리 목록만은 `(tabs)/prices/_query.ts`의 `PRICE_GROUPS`를 그대로
// 재사용한다 — **7종 한글 그룹 ↔ Spring `ItemCategory` enum 매핑이 이미 그 파일에 있고**
// 시세 탭과 제보 카테고리가 같은 7종이라 새로 매핑표를 만들면 두 곳이 어긋날 수 있다.
// 서버에서 지원하지 않는 `깨·견과류`는 제품 범위에서 제외한다. 참깨·땅콩은
// 현재 서버 계약에 맞춰 `마늘·파·생강`에 포함된 상태로 유지한다.

/** F04-2 1단 — 카테고리 목록. 코드 정본 7종(시세 탭과 동일). */
export const REPORT_CATEGORIES: VegetableGroup[] = PRICE_GROUPS.map((group) => group.label);

const REPORT_VEGETABLE_PAGE_SIZE = 100;

export interface ReportVegetableOption {
  /** Spring itemId를 문자열로 다룬다(URL 파라미터라 원래도 문자열). */
  id: string;
  name: string;
  /** Spring `defaultUnit` 그대로 — 단위가 정해지지 않은 품목은 null. 값을 발명하지 않는다. */
  unit: string | null;
}

function toReportVegetableOption(item: { itemId: number; itemName: string; defaultUnit?: string | null }): ReportVegetableOption {
  return { id: String(item.itemId), name: item.itemName, unit: item.defaultUnit ?? null };
}

/**
 * F04-2 2단 — 카테고리 안 야채 목록 / 검색 결과.
 *
 * 페이지네이션 UI가 없는 화면이라 한 번에 충분히 큰 사이즈(100)로 받는다.
 * `category`·`keyword`를 함께 넘기지 않는다 — 원래 더미 구현도 검색은 카테고리 제한 없이
 * 전체를 대상으로 했다(`searchReportVegetables`가 `VEGETABLES` 전체를 훑던 것과 동일).
 */
export async function getReportVegetables(params: {
  regionId: string;
  token: string | undefined;
  category?: VegetableGroup;
  keyword?: string;
}): Promise<{ vegetables: ReportVegetableOption[]; isTemporary: boolean }> {
  const { page, isTemporary } = await getItemsWithTemporaryFallback({
    regionId: params.regionId,
    token: params.token,
    category: params.keyword ? undefined : mapGroupToApi(params.category),
    keyword: params.keyword,
    sort: "NAME_ASC",
    size: REPORT_VEGETABLE_PAGE_SIZE,
  });
  return { vegetables: page.items.map(toReportVegetableOption), isTemporary };
}

/** URL의 `group` 쿼리값을 코드 정본 7종으로 좁힌다(시세 탭과 같은 검증 함수 재사용). */
export function normalizeReportGroup(raw: string | undefined): VegetableGroup | undefined {
  return normalizeGroup(raw);
}

/**
 * 제보 폼이 itemId로 값을 되찾을 때 쓴다(F04-1이 이미 고른 품목을 다시 보여줄 때).
 *
 * 이건 "다시 보여주기"일 뿐 제출이 아니다 — 실제 인증 확인은 제출 Server Action
 * (`_actions.ts`)이 한다. 그래서 품목이 없어졌거나(404) 잘못된 id(400)뿐 아니라 토큰이
 * 만료됐어도(401·403) 조용히 undefined를 돌려준다. 여기서 던지면 로그인 만료 하나로
 * 폼을 아직 제출하지도 않은 사용자가 전체 에러 화면을 보게 된다 — 과한 반응이다.
 */
export async function getReportVegetable(params: {
  itemId: number;
  regionId: string;
  token: string | undefined;
}): Promise<{ vegetable: ReportVegetableOption | undefined; isTemporary: boolean }> {
  try {
    const { detail, isTemporary } = await getItemDetailWithTemporaryFallback(params);
    return { vegetable: toReportVegetableOption(detail), isTemporary };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.kind === "notFound" ||
        error.kind === "badRequest" ||
        error.kind === "unauthorized" ||
        error.kind === "forbidden")
    ) {
      return { vegetable: undefined, isTemporary: false };
    }
    throw error;
  }
}

/**
 * F04-3에서 고른 장소를 URL로 물고 다닐 때 쓰는 JSON 문자열을 만든다.
 *
 * 카카오 검색 결과는 id로 재조회할 수 있는 엔드포인트가 없어(키워드 재검색만 가능하고 순서·
 * 존재가 보장 안 됨) 제출에 필요한 필드 전체를 실어 날라야 한다. 가게 공개 정보라 URL에
 * 실어도 무방하다(민감정보 아님).
 */
export function encodeCarriedStore(store: StoreRequest): string {
  return JSON.stringify(store);
}

/** 위 함수의 역변환. 형식이 깨졌거나 없으면 조용히 undefined — 장소를 다시 고르면 된다. */
export function parseCarriedStore(raw: string | undefined): StoreRequest | undefined {
  if (!raw) return undefined;
  try {
    const parsed = storeRequestSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
