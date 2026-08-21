import "server-only";

import { ApiError } from "@/app/_lib/api/api-error";
import { getStoreDetail } from "@/app/_lib/api/server/stores";

export interface ExistingReportStoreSelection {
  source: "existing";
  storeId: number;
  placeName: string;
}

/** URL은 매장 ID만 전달하고, 사용자에게 보여 줄 이름은 서버의 매장 상세에서 다시 확인한다. */
export async function getExistingReportStoreSelection(params: {
  storeId: number;
  token: string | undefined;
}): Promise<ExistingReportStoreSelection | undefined> {
  try {
    const detail = await getStoreDetail(params);
    const placeName = detail.storeName.trim();
    if (!placeName) return undefined;

    return { source: "existing", storeId: params.storeId, placeName };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("제보 기존 매장 조회 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
      storeId: params.storeId,
    });
    return undefined;
  }
}
