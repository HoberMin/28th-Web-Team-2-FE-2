"use server";

import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { createReportRequestSchema, type StoreRequest } from "@/app/_lib/api/schemas/reports";
import { createReport } from "@/app/_lib/api/server/reports";
import { getSelectedRegionId } from "@/app/_lib/api/server/selected-region";

/**
 * Figma에 "구매/목격" 토글이 없다(제보 폼 어디에도 이 값을 고르는 UI가 없음). 유일하게 UI가
 * 있는 흐름이 "사진 찍어 가격 입력"이라 실제 구매 확인에 가깝다고 보고 PURCHASE로 고정한다.
 * 토글이 생기면 이 상수만 바꾸면 된다. (다른 미정 판단들과 함께 `_report-form.tsx` 머리말에도
 * 같은 기록을 남겨 둔다 — 이 레포는 정의되지 않은 지점의 판단을 한곳에 모으는 관행이 있다)
 */
const FIXED_REPORT_TYPE = "PURCHASE";

export type SubmitReportResult =
  | { status: "success" }
  | { status: "unauthorized"; message: string }
  | { status: "conflict"; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export interface SubmitReportInput {
  itemId: number;
  store: StoreRequest;
  price: number;
  amount: number;
  /** 폼에서 선택한 판매 단위(`kg`·`g`·`개`·`포기`). */
  unit: string;
}

/**
 * ⚠️ **Server Action은 네트워크 진입점이다** — 이 인자는 브라우저가 보낸 값이고, 타입 선언은
 * 런타임에 아무것도 막지 않는다. 특히 `store`는 F04-3이 URL(`store=` JSON 쿼리)로 물고 다니는
 * 값이라 조작이 쉽다. RSC 경로(`_data.ts#parseCarriedStore`)가 이미 zod로 거르지만 그건
 * **화면에 그릴 때**의 검증이고, 액션은 클라이언트가 직접 부를 수 있으므로 그 검증을 우회한다.
 * → 제출 직전에 스펙 스키마(`createReportRequestSchema`)로 한 번 더 판정하고, 통과한 값만
 * Spring에 넘긴다(`nextjs-app-router` "입력은 zod로 서버에서 재검증").
 * 부수 효과로 `Number("가격")` = NaN 같은 입력도 Spring 400 대신 안내 문구로 끝난다.
 */
export async function submitReportAction(input: SubmitReportInput): Promise<SubmitReportResult> {
  const itemId = input?.itemId;
  if (typeof itemId !== "number" || !Number.isSafeInteger(itemId) || itemId <= 0) {
    return { status: "invalid", message: "품목 정보가 올바르지 않아요. 다시 선택해 주세요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { status: "unauthorized", message: "제보하려면 카카오 로그인이 필요해요." };
  }

  const regionId = await getSelectedRegionId();
  if (!regionId) {
    return { status: "error", message: "동네 정보가 필요해요. 동네를 다시 선택해 주세요." };
  }

  const body = createReportRequestSchema.safeParse({
    regionId,
    reportType: FIXED_REPORT_TYPE,
    price: input.price,
    unit: input.unit,
    amount: input.amount,
    store: input.store,
    // photoUrl 생략 — 현재 스펙에는 바이너리를 받을 업로드 엔드포인트가 없다.
    // 사진 File은 클라이언트 IndexedDB에 보관 중이며, multipart 계약이 나오면 이 단일
    // 제출 어댑터에서 FormData로 함께 전송한다. 로컬 blob URL을 서버에 넘기지는 않는다.
  });
  if (!body.success) {
    return { status: "invalid", message: "입력값을 확인해 주세요." };
  }
  // 스키마는 `store`를 optional로 둔다(스펙상 `storeId`로 붙이는 경로가 따로 있어서다).
  // 이 플로우는 항상 `store`로 보내므로 여기서 필수로 좁힌다 — 장소 없는 제보는 시세 비교에
  // 쓸 수 없다는 폼의 판단(`_report-form.tsx` canSubmit)을 서버에서도 같게 유지한다.
  if (!body.data.store) {
    return { status: "invalid", message: "판매 장소를 선택해 주세요." };
  }

  try {
    await createReport({ itemId, token, body: body.data });
    return { status: "success" };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;

    console.error("가격 제보 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });

    if (error.isAuthExpired || error.kind === "forbidden") {
      await clearTokens();
      return { status: "unauthorized", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "conflict") {
      return { status: "conflict", message: "이미 같은 제보가 있어요." };
    }
    if (error.kind === "notFound") {
      return { status: "invalid", message: "품목 또는 가게 정보를 찾을 수 없어요." };
    }
    if (error.kind === "badRequest") {
      return { status: "invalid", message: "입력값을 확인해 주세요." };
    }
    return { status: "error", message: "제보를 등록하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
}
