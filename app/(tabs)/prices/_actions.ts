"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/app/_lib/api/api-error";
import { getAccessToken } from "@/app/_lib/api/auth/session";
import { setItemFavorite } from "@/app/_lib/api/server/items";
import { ROUTES } from "@/app/_lib/routes";

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
    revalidatePath(ROUTES.prices);
    revalidatePath(ROUTES.saved);
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
