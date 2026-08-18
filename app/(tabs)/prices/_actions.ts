"use server";

import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { setItemFavorite } from "@/app/_lib/api/server/items";

export type FavoriteMutationResult =
  | { status: "success" }
  | { status: "unauthorized"; message: string }
  | { status: "error"; message: string };

export async function updateItemFavorite(
  itemId: number,
  liked: boolean,
): Promise<FavoriteMutationResult> {
  if (!Number.isSafeInteger(itemId) || itemId <= 0) {
    return { status: "error", message: "야채 정보가 올바르지 않아요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { status: "unauthorized", message: "찜하려면 카카오 로그인이 필요해요." };
  }

  try {
    await setItemFavorite({ itemId, liked, token });
    // 인증 품목 조회는 no-store이고 호출 카드가 성공 후 router.refresh()한다.
    // 공개 게스트 캐시에는 개인 찜이 없으므로 여기서 무효화하지 않는다.
    return { status: "success" };
  } catch (error) {
    if (error instanceof ApiError && error.isAuthExpired) {
      return { status: "unauthorized", message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error instanceof ApiError && error.kind === "notFound") {
      return { status: "error", message: "야채 정보를 찾을 수 없어요." };
    }
    return { status: "error", message: "찜 상태를 바꾸지 못했어요. 다시 시도해 주세요." };
  }
}
