"use server";

import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { createReportRequestSchema, type StoreRequest } from "@/app/_lib/api/schemas/reports";
import {
  ALLOWED_UPLOAD_IMAGE_TYPES,
  MAX_UPLOAD_IMAGE_BYTES,
  uploadImage,
} from "@/app/_lib/api/server/images";
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
  /** `uploadReportPhotoAction`이 돌려준 S3 URL. 사진을 안 올렸으면 없다. */
  photoUrl?: string;
}

export type UploadPhotoResult =
  | { status: "success"; imageUrl: string }
  | { status: "unauthorized"; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

/**
 * 제보 사진 업로드 — `POST /api/v1/images`.
 *
 * 제보 생성과 **분리된 두 단계**다(스펙이 그렇게 나뉘어 있다): 여기서 받은 `imageUrl`을
 * `submitReportAction`의 `photoUrl`로 넘긴다. 업로드가 실패해도 제보 자체는 보낼 수 있게
 * 호출부가 사진 없이 계속 진행할지 정한다.
 *
 * 형식·용량은 Spring이 400을 주기 전에 여기서 먼저 거른다 — 왕복 한 번을 아끼고, 사용자가
 * 받는 문구가 "잘못된 요청"이 아니라 무엇이 문제인지가 된다.
 */
export async function uploadReportPhotoAction(formData: FormData): Promise<UploadPhotoResult> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "invalid", message: "사진 파일을 찾지 못했어요. 다시 선택해 주세요." };
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    return { status: "invalid", message: "사진 용량이 너무 커요. 10MB 이하로 올려 주세요." };
  }
  if (!ALLOWED_UPLOAD_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_IMAGE_TYPES)[number])) {
    return { status: "invalid", message: "JPG·PNG·WEBP 사진만 올릴 수 있어요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { status: "unauthorized", message: "사진을 올리려면 카카오 로그인이 필요해요." };
  }

  try {
    const imageUrl = await uploadImage({ file, token });
    return { status: "success", imageUrl };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;

    console.error("제보 사진 업로드 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });

    if (error.isAuthExpired || error.kind === "forbidden") {
      await clearTokens();
      return { status: "unauthorized", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "badRequest") {
      return { status: "invalid", message: "사진 형식을 확인해 주세요." };
    }
    // 503(스토리지 장애)도 여기로 온다 — 사진 없이 제보를 계속할 수 있게 안내한다.
    return { status: "error", message: "사진을 올리지 못했어요. 사진 없이 제보할 수 있어요." };
  }
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
    // 사진은 `uploadReportPhotoAction`이 먼저 올리고 그 결과 URL만 여기로 온다
    // (2026-08-20 `POST /api/v1/images` 연결). 로컬 blob URL은 절대 넘기지 않는다.
    photoUrl: input.photoUrl,
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
