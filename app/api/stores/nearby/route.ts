import { getAccessToken } from "@/app/_lib/api/auth/session";
import { nearbyStoresRequestSchema } from "@/app/_lib/api/schemas/stores";
import { getNearbyStores } from "@/app/_lib/api/server/stores";
import { privateJson, storesApiErrorResponse } from "../_api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const parsed = nearbyStoresRequestSchema.safeParse({
    latitude: searchParams.get("latitude") ?? undefined,
    longitude: searchParams.get("longitude") ?? undefined,
    radius: searchParams.get("radius") ?? undefined,
    onlyLiked: searchParams.get("onlyLiked") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  });

  if (!parsed.success) {
    return privateJson({ message: "가게 조회 조건을 확인해 주세요." }, 400);
  }

  const token = await getAccessToken();

  try {
    const stores = await getNearbyStores({ ...parsed.data, token });
    return privateJson(stores);
  } catch (error) {
    return storesApiErrorResponse(error);
  }
}
