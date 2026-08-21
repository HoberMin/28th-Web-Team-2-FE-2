"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { deleteMyReport } from "@/app/_lib/api/server/my-reports";
import { ROUTES } from "@/app/_lib/routes";

// F05 「내 제보」 전용 Server Action. `mypage/regions/_actions.ts`와 같은 방식으로
// 이미 있는 서버 fetch 함수를 그대로 부른다 — Route Handler(`app/api/my-reports/*`)는
// 클라이언트 fetch 전용 경로라 여기서는 거치지 않는다.

export type MyReportActionResult = { ok: true } | { ok: false; message: string };

/**
 * 내 제보 삭제.
 *
 * Server Action은 클라이언트가 임의 인자로 부를 수 있는 **공개 진입점**이라 화면이 넘긴
 * 값을 믿지 않고 여기서 다시 검증한다. `reportId`는 Spring URL 경로에 보간되므로
 * 숫자가 아니면 아예 보내지 않는다(`regions/_actions.ts`의 `parseRegionId`와 같은 이유).
 *
 * 남의 제보를 지우려 하면 Spring이 404를 준다 — "없음"이 아니라 "지울 수 없는 제보"로 옮긴다.
 */
export async function deleteMyReportAction(reportId: number): Promise<MyReportActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, message: "로그인이 필요해요." };

  if (!Number.isSafeInteger(reportId) || reportId <= 0) {
    return { ok: false, message: "제보 정보가 올바르지 않아요." };
  }

  try {
    await deleteMyReport({ reportId, token });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("내 제보 삭제 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
    if (error.isAuthExpired) {
      await clearTokens();
      return { ok: false, message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "notFound") {
      return { ok: false, message: "지울 수 없는 제보예요." };
    }
    return { ok: false, message: "제보를 지우지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath(ROUTES.mypage);
  return { ok: true };
}
