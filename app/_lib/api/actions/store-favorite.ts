"use server";

// 가게 단골 토글 Server Action.
//
// 야채 찜(`app/(tabs)/prices/_actions.ts#updateItemFavorite`)과 같은 계약이지만, 호출하는
// 화면이 셋(F03 지도 · F03-3 가게 상세 · F04 찜 「가게」 탭 · F05 마이페이지)이라 화면
// 폴더가 아니라 API 레이어에 둔다.

import { ApiError } from "../api-error";
import { clearTokens, getAccessToken } from "../auth/session";
import { setStoreFavorite } from "../server/stores";

export type StoreFavoriteResult =
  | { status: "success" }
  | { status: "unauthorized"; message: string }
  | { status: "error"; message: string };

export async function updateStoreFavorite(
  storeId: number,
  liked: boolean,
): Promise<StoreFavoriteResult> {
  if (!Number.isSafeInteger(storeId) || storeId <= 0) {
    return { status: "error", message: "가게 정보가 올바르지 않아요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { status: "unauthorized", message: "단골로 등록하려면 카카오 로그인이 필요해요." };
  }

  try {
    await setStoreFavorite({ storeId, liked, token });
    // 단골 여부가 담긴 응답은 전부 no-store다 — 공유 캐시에는 개인 상태가 없으므로
    // 여기서 태그를 무효화하지 않는다(`server/stores.ts#setStoreFavorite` 주석).
    // 목록 화면은 호출부가 router.refresh()로 다시 그린다.
    return { status: "success" };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;

    console.error("가게 단골 변경 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });

    if (error.isAuthExpired || error.kind === "forbidden") {
      await clearTokens();
      return { status: "unauthorized", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "notFound") {
      return { status: "error", message: "가게 정보를 찾을 수 없어요." };
    }
    return { status: "error", message: "단골 상태를 바꾸지 못했어요. 다시 시도해 주세요." };
  }
}
