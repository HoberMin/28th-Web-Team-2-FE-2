import { getAccessToken } from "@/app/_lib/api/auth/session";
import { addUserRegionRequestSchema } from "@/app/_lib/api/schemas/regions";
import { addUserRegion, getUserRegions } from "@/app/_lib/api/server/regions";
import { userRegionsApiErrorResponse } from "../_user-regions-error";

// `cookies()`(→ `getAccessToken()`)를 쓰는 순간 이 라우트는 동적이다 — 로그인 사용자별
// 응답이라 애초에 캐싱 대상도 아니다.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  try {
    return Response.json(await getUserRegions(token));
  } catch (error) {
    return userRegionsApiErrorResponse(error, "관심 지역을 불러오지 못했어요.");
  }
}

export async function POST(request: Request): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  const parsed = addUserRegionRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  try {
    await addUserRegion({ regionId: parsed.data.regionId, token });
    return new Response(null, { status: 204 });
  } catch (error) {
    return userRegionsApiErrorResponse(error, "동네 정보가 올바르지 않아요.");
  }
}
